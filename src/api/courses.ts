import { Router } from "express";
import {
  AuthenticatedRequest,
  requireAuthentication,
} from "../util/authentication.js";
import { Assignment } from "../models/assignments.js";
import { Parser } from "json2csv";
import { QueryOptions } from "../types/database.js";
import { Course, CourseType } from "../models/courses.js";
import { PAGE_SIZE } from "../util/constants.js";
import { allowedInBody, requiredInBody } from "../util/middleware.js";
import { User } from "../models/users.js";

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

router.get(
  "/:id/roster",
  requireAuthentication({ role: "instructor" }),
  async (req: AuthenticatedRequest, res) => {
    const courseId = req.params.id;
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const studentRoster = course.studentIds.length
        ? await User.findAll({
            where: {
              $in: {
                id: course.studentIds,
              },
            },
          })
        : [];

      // Extract student info
      const studentData = studentRoster.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
      }));

      // Convert the student information to CSV
      const json2csvParser = new Parser({ fields: ["id", "name", "email"] });
      const csv = json2csvParser.parse(studentData);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=roster_${courseId}.csv`,
      );
      res.setHeader("Content-Type", "text/csv");
      res.send(csv);
    } catch (error) {
      console.error("Error fetching course roster:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post("/:id/students", (req, res) => {
  const courseId = req.params.id;
  const studentData = req.body;
  // TODO: Implement
  res.send();
});

router.get(
  "/:id/students",
  requireAuthentication(),
  async (req: AuthenticatedRequest, res) => {
    try {
      const courseId = req.params.id;
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const authUser = req.user!;

      if (
        authUser.role !== "admin" &&
        (authUser.role !== "instructor" || authUser.id !== course.instructorId)
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const students = course.studentIds;

      const studentsInClass = [];
      for (let i = 0; i < students.length; i++) {
        const users = await User.findById(students[i]);
        var temp = {
          name: users.name,
          email: users.email,
          role: users.role,
        };
        studentsInClass[i] = temp;
      }

      res.json({ students: studentsInClass });
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/:id",
  requireAuthentication({ role: "admin" }),
  async (req, res) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    await course.delete();
    res.status(204).send();
  },
);

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
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Invalid data" });
    }
    if (typeof subject === "string") course.subject = subject;
    if (typeof number === "string") course.number = number;
    if (typeof title === "string") course.title = title;
    if (typeof term === "string") course.term = term;
    if (typeof instructorId === "string") course.instructorId = instructorId;
    await course.save();
    const data: Record<string, unknown> = course.toJSON() as unknown as Record<
      string,
      unknown
    >;
    delete data.studentIds;
    res.send(data);
  },
);

router.get("/:id", async (req, res) => {
  const courseId = req.params.id;
  const course = await Course.findById(courseId);
  if (course) {
    const data: Record<string, unknown> = course.toJSON() as unknown as Record<
      string,
      unknown
    >;
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
      number: number,
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
  const resultPage = Math.max(Number(page) || 1) || 1;
  const options: QueryOptions<CourseType> = {
    limit: PAGE_SIZE,
    cursor: (resultPage - 1) * PAGE_SIZE,
    where: {},
  };
  if (subject) options.where!.subject = `${subject}`;
  if (number) options.where!.number = `${number}`;
  if (term) options.where!.term = `${term}`;
  const results = await Course.findAll(options);
  res.json({
    courses: results.map((course) => {
      const data: Record<string, unknown> =
        course.toJSON() as unknown as Record<string, unknown>;
      delete data.studentIds;
      return data;
    }),
  });
});

export default router;
