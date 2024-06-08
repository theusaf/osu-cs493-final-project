import { Router } from "express";
import {
  AuthenticatedRequest,
  requireAuthentication,
} from "../util/authentication.js";
import { Assignment } from "../models/assignments.js";
import { Course } from "../models/courses.js";
import { Parser } from "json2csv"
import { connection } from "../firebase.js";

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
//Not positive this works. Can you take a look at it daniel?
router.get(
  "/:id/roster",
  requireAuthentication({
    filter: (req: AuthenticatedRequest) => {
      const user = req.user!;
      return user.role === "instructor" || user.role === "admin";
    },
  }),
  async (req: AuthenticatedRequest, res) => {
    const courseId = req.params.id;
  try {
  
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({error: "Course not found"});
    }

    const studentRoster = await connection.collection('users').where('id', 'in', course.studentIds).get();
    const students = studentRoster.docs.map(doc => doc.data());

    //extract student info
    const studentData = students.map(student=> ({
      id: student.id,
      name: student.name,
      email: student.email,
    }));

    // Convert the student information to CSV
    const json2csvParser = new Parser({ fields: ['id', 'name', 'email'] });
    const csv = json2csvParser.parse(studentData);

    res.setHeader('Content-Disposition', `attachment; filename=roster_${courseId}.csv`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
    } catch (error) {
      console.error('Error fetching course roster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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
