import { Router } from "express";

const router = Router();

router.get("/:id/assignments", (req, res) => {
  const courseId = req.params.id;
  // TODO: Implement
  res.json({
    assignments: [
      {
        courseId: 123,
        title: "Assignment 3",
        points: 100,
        due: "2022-06-14T17:00:00-07:00",
      },
    ],
  });
});

router.get("/:id/roster", (req, res) => {
  const courseId = req.params.id;
  // TODO: Implement
  res.send('123,"Jane Doe",doej@oregonstate.edu\n...');
});

router.post("/:id/students", (req, res) => {
  const courseId = req.params.id;
  const studentData = req.body;
  // TODO: Implement
  res.send();
});

router.get("/:id/students", (req, res) => {
  const courseId = req.params.id;
  // TODO: Implement
  res.json({
    students: [
      {
        name: "Jane Doe",
        email: "doej@oregonstate.edu",
        password: "hunter2",
        role: "student",
      },
    ],
  });
});

router.delete("/:id", (req, res) => {
  const courseId = req.params.id;
  // TODO: Implement
  res.status(204).send();
});

router.patch("/:id", (req, res) => {
  const courseId = req.params.id;
  const courseData = req.body;
  // TODO: Implement
  res.send();
});

router.get("/:id", (req, res) => {
  const courseId = req.params.id;
  // TODO: Implement
  res.json({
    subject: "CS",
    number: "493",
    title: "Cloud Application Development",
    term: "sp22",
    instructorId: 123,
  });
});

router.post("/", (req, res) => {
  const courseData = req.body;
  // TODO: Implement
  res.status(201).json({
    id: 123,
  });
});

router.get("/", (req, res) => {
  const { page, subject, number, term } = req.query;
  // TODO: Implement
  res.json({
    courses: [
      {
        subject: "CS",
        number: "493",
        title: "Cloud Application Development",
        term: "sp22",
        instructorId: 123,
      },
    ],
  });
});

export default router;
