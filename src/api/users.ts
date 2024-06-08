import { Router } from "express";
import {
  PartiallyAuthenticatedRequest,
  createSessionToken,
  hash,
  verify,
} from "../util/authentication.js";
import { User, UserType } from "../models/users.js";

const router = Router();

router.get("/:id", (req, res) => {
  const userId = req.params.id;
  // TODO: Implement
  res.json({
    name: "Jane Doe",
    email: "doej@oregonstate.edu",
    password: "hunter2",
    role: "student",
  });
});

router.post("/", async (req: PartiallyAuthenticatedRequest, res) => {
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
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const sendError = () => {
    res.status(401).json({
      error: "Invalid email or password",
    });
  };
  if (typeof email !== "string" || typeof password !== "string") {
    return sendError();
  }
  const [user] = await User.findAll({ where: { email }, limit: 1 });
  if (!user) return sendError();
  if (!(await verify(user.password, password))) return sendError();
  res.json({
    token: createSessionToken(user.id!),
  });
});

export default router;