import { Router } from "express";

const router = Router();

router.post("/:id/submissions", (req, res) => {
  const assignmentId = req.params.id;
  const submissionData = req.body;
  // TODO: Implement
  res.status(201).json({
    id: 123,
  });
});

router.get("/:id/submissions", (req, res) => {
  const assignmentId = req.params.id;
  // TODO: Implement
  res.json({
    submissions: [
      {
        assignmentId: 123,
        studentId: 123,
        timestamp: "2022-06-14T17:00:00-07:00",
        grade: 94.5,
        file: "string",
      },
    ],
  });
});

router.delete("/:id", (req, res) => {
  const assignmentId = req.params.id;
  // TODO: Implement
  res.status(204).send();
});

router.patch("/:id", (req, res) => {
  const assignmentId = req.params.id;
  const assignmentData = req.body;
  // TODO: Implement
  res.status(200).send();
});

router.get("/:id", (req, res) => {
  const assignmentId = req.params.id;
  // TODO: Implement
  res.json({
    courseId: 123,
    title: "Assignment 3",
    points: 100,
    due: "2022-06-14T17:00:00-07:00",
  });
});

router.post("/", (req, res) => {
  const assignmentData = req.body;
  // TODO: Implement
  res.status(201).json({
    id: 123,
  });
});

export default router;
