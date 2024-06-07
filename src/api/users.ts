import { Router } from "express";
import { createSessionToken, verify } from "../util/authentication.js";
import { User } from "../models/users.js";

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

router.post("/", (req, res) => {
  const userData = req.body;
  // TODO: Implement
  res.status(201).json({
    id: 123,
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
    token: createSessionToken(user.id),
  });
});

export default router;
