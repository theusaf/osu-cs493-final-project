import { Router } from "express";
import { Assignment } from "../models/assignments.js";
import { QueryOptions } from "../types/database.js";
import { Course, CourseType } from "../models/courses.js";
import { PAGE_SIZE } from "../util/constants.js";
import { requireAuthentication } from "../util/authentication.js";
import { allowedInBody, requiredInBody } from "../util/middleware.js";

const router = Router();

router.get("/:id/assignments", async (req, res) => {
  const courseId = req.params.id;
  try {
    const assignments = await Assignment.findAll({
      where: {
        courseId,
      },
    });

    res.json({ assignments: assignments.map((a) => a.toJSON()) });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/roster", (req, res) => {
  const courseId = req.params.id;
  // TODO: Implement
  try {
  } catch (error) {}
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

router.patch(
  "/:id",
  requireAuthentication({
    role: "instructor",
    filter: async (req) => {
      const courseId = req.params.id;
      const course = await Course.findById(courseId);
      if (!course) return false;
      return course.instructorId === req.userId;
    },
  }),
  allowedInBody(["subject", "number", "title", "term", "instructorId"]),
  async (req, res) => {
    const courseId = req.params.id;
    const { subject, number, title, term, instructorId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (typeof subject === "string") course.subject = subject;
    if (typeof number === "string") course.classNumber = number;
    if (typeof title === "string") course.title = title;
    if (typeof term === "string") course.term = term;
    if (typeof instructorId === "string") course.instructorId = instructorId;
    await course.save();
    const data: Record<string, unknown> = course.toJSON();
    delete data.studentIds;
    res.send(data);
  },
);

router.get("/:id", async (req, res) => {
  const courseId = req.params.id;
  const course = await Course.findById(courseId);
  if (course) {
    const data: Record<string, unknown> = course.toJSON();
    delete data.studentIds;
    res.json(data);
  } else {
    res.status(404).json({ error: "Course not found" });
  }
});

router.post(
  "/",
  requireAuthentication({
    role: "admin",
  }),
  requiredInBody(["subject", "number", "title", "term", "instructorId"]),
  async (req, res) => {
    const { subject, number, title, term, instructorId } = req.body;
    if (
      typeof subject !== "string" ||
      typeof number !== "string" ||
      typeof title !== "string" ||
      typeof term !== "string" ||
      typeof instructorId !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid data",
      });
    }
    const course = new Course({
      subject,
      classNumber: number,
      title,
      term,
      instructorId,
      studentIds: [],
    });
    await course.save();
    res.status(201).json({
      id: course.id,
    });
  },
);

router.get("/", async (req, res) => {
  const { page, subject, number, term } = req.query;
  let resultPage = Math.max(Number(page) || 1) || 1;
  const options: QueryOptions<CourseType> = {
    limit: PAGE_SIZE,
    cursor: (resultPage - 1) * PAGE_SIZE,
    where: {},
  };
  if (subject) options.where!.subject = `${subject}`;
  if (number) options.where!.classNumber = `${number}`;
  if (term) options.where!.term = `${term}`;
  const results = await Course.findAll(options);
  res.json({
    courses: results.map((course) => {
      const data: Record<string, unknown> = course.toJSON();
      delete data.studentIds;
      return data;
    }),
  });
});

export default router;
