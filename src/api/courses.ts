import { Router } from "express";
import { Assignment } from "../models/assignments.js";

const router = Router();

router.get("/:id/assignments", async (req, res) => {
  const courseId = req.params.id;
  try{
    const assignments = await Assignment.findAll({ where: {
      courseId
    } });

    res.json({assignments: assignments.map(a => a.toJSON())});
  } catch (error) {
    console.error("Error fetching assignments:", error)
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/roster", (req, res) => {
  const courseId = req.params.id;
  // TODO: Implement
  try {

  } catch (error) {

  }
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
