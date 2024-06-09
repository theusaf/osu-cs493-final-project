import { Router } from "express";
import {
  AuthenticatedRequest,
  PartiallyAuthenticatedRequest,
  createSessionToken,
  hash,
  requireAuthentication,
  verify,
} from "../util/authentication.js";
import { User } from "../models/users.js";
import { requiredInBody } from "../util/middleware.js";
import { Course } from "../models/courses.js";

const router = Router();

router.get(
  "/:id",
  requireAuthentication({
    filter: (req) => req.params.id !== req.userId,
  }),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.params.id;
    const user = req.user!;
    const baseInfo: Record<string, unknown> = {
      name: user.name,
      email: user.email,
      role: user.role,
    };
    if (user.role === "student") {
      const courses = await Course.findAll({
        where: {
          $in: {
            studentIds: [userId],
          },
        },
      });
      res.json({
        ...baseInfo,
        courses: courses.map((course) => course.id),
      });
    } else if (user.role === "instructor") {
      const courses = await Course.findAll({ where: { instructorId: userId } });
      res.json({
        ...baseInfo,
        courses: courses.map((course) => course.id),
      });
    } else {
      res.json(baseInfo);
    }
  },
);

router.post(
  "/",
  requiredInBody(["name", "email", "password", "role"]),
  async (req: PartiallyAuthenticatedRequest, res) => {
    const loggedUserId = req.userId;
    const userData = req.body;
    if (
      typeof userData.name !== "string" ||
      typeof userData.email !== "string" ||
      typeof userData.password !== "string" ||
      typeof userData.role !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid data",
      });
    }
    if (!["admin", "instructor", "student"].includes(userData.role)) {
      return res.status(400).json({
        error: "Invalid data",
      });
    }
    if (["admin", "instructor"].includes(userData.role)) {
      const sendUnauthorized = () => {
        res.status(403).json({
          error: "Unauthorized",
        });
      };
      if (!loggedUserId) return sendUnauthorized();
      const user = await User.findById(loggedUserId);
      if (user.role !== "admin") return sendUnauthorized();
    }
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: await hash(userData.password),
      role: userData.role,
    });
    await newUser.save();
    res.status(201).json({
      id: newUser.id,
    });
  },
);

router.post(
  "/login",
  requiredInBody(["email", "password"]),
  async (req, res) => {
    const { email, password } = req.body;
    const sendError = () => {
      res.status(401).json({
        error: "Invalid email or password",
      });
    };
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Invalid data",
      });
    }
    const [user] = await User.findAll({ where: { email }, limit: 1 });
    if (!user) return sendError();
    if (!(await verify(user.password, password))) return sendError();
    res.json({
      token: createSessionToken(user.id!),
    });
  },
);

export default router;