import { Router } from "express";

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

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  // TODO: Implement
  res.json({
    token: "aaaaaaaa.bbbbbbbb.cccccccc",
  });
});

export default router;
