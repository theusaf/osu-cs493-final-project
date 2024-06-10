import { Router } from "express";
import { allowedInBody, requiredInBody } from "../util/middleware.js";
import { requireAuthentication } from "../util/authentication.js";
import { Course } from "../models/courses.js";
import { User } from "../models/users.js";
import { Assignment } from "../models/assignments.js";
import { Submission, SubmissionType } from "../models/submissions.js";
import admin from "firebase-admin";
import multer from "multer";
import path from "path";

const bucket = admin.storage().bucket();

const storage = multer.memoryStorage();

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, allowedMimeTypes.includes(file.mimetype));
  }
}).single("file");


const router = Router();

router.post("/:id/submissions", requiredInBody(["assignmentId", "studentId", "timestamp"]), requireAuthentication({
    role: "student",
    filter: async req => {
        const assignmentId = req.params.id;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return false;
        }
        const courseId = assignment.courseId.toString();
        const course = await Course.findById(courseId);
        if (!course) {
            return false;
        }
        const isStudent = course.studentIds.includes(req.userId!);
        return isStudent;
    }
}), upload.single("file"), async (req, res) => {
  const assignmentId = req.params.id;
  const submissionData = req.body;
  
  const submission = new Submission({
    assignmentId: submissionData.assignmentId,
    studentId: submissionData.studentId,
    timestamp: submissionData.timestamp, //Date
    grade: -1,
    file: req.file
    });

  try {
    const id = await submission.save();
    res.status(201).json({ id: id });
    } catch (error) {
      res.status(400).json({ message: "Failed to post submission"});
    }
});

router.get("/:id/submissions/:page/:limit", requireAuthentication({
    role: "instructor",
    filter: async req => {
        const assignmentId = req.params.id;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return false;
        }
        const courseId = assignment.courseId.toString();
        const course = await Course.findById(courseId);
        if (!course) {
            return false;
        }
        const instructorId = course.instructorId.toString();
        const user = await User.findById(req.userId!);
        return user.role === "admin" || user.id == instructorId;
    }
}), async (req, res) => {
  const assignmentId = req.params.id;
  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);
  const offset = (page - 1) * limit;
  const assignment = await Assignment.findById(assignmentId);
  const submissions = await Submission.findAll({
    where: {
        assignmentId: assignment.id
    },
    limit: limit,
    cursor: offset
    
    });
  const submissionUrls = submissions.map(submission => ({
    id: submission.id,
    url: `/submissions/${submission.id}`
  }));
  
  res.status(200).json({
      submissions: submissionUrls
  });
});

router.delete("/:id", requireAuthentication({
    role: "instructor",
    filter: async req => {
        const assignmentId = req.params.id;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return false;
        }
        const courseId = assignment.courseId.toString();
        const course = await Course.findById(courseId);
        if (!course) {
            return false;
        }
        const instructorId = course.instructorId.toString();
        const user = await User.findById(req.userId!);
        return user.role === "admin" || user.id == instructorId;
    }
}), async(req, res) => {
  const assignmentId = req.params.id;
  const assignment = await Assignment.findById(assignmentId);
  try {
    const deleted = await assignment.delete()
    res.status(204).send();
  } catch (error) {
    res.status(500).json({error: "Assignment not Deleted"});
  }
});

router.patch(
  "/:id",
  allowedInBody(["title", "points", "due"]),
  requireAuthentication({
    role: "instructor",
    filter: async (req) => {
      const assignmentId = req.params.id;
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return false;
      }
        const courseId = assignment.courseId.toString();
        const course = await Course.findById(courseId);
        if (!course) {
            return false;
        }
        
        const instructorId = course.instructorId.toString();
        const user = await User.findById(req.userId!);
        return user.role === "admin" || user.id === instructorId;
        }
    }), async (req, res) => {

    const assignmentId = req.params.id;
    const assignmentData = req.body;
    const savedAssignment = await Assignment.findById(assignmentId);

    try {
        Object.keys(assignmentData).forEach( key => {
        (savedAssignment as any)[key] = assignmentData[key]
        });

        const assignment = savedAssignment.save();
        res.status(200).json(assignment);

    } catch (error) {
        res.status(400).json({error: "Failed to update assignment"});
    }
});

router.get("/:id", async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const assignment = await Assignment.findById(assignmentId);
    res.status(200).json({
      courseId: assignment.courseId,
      title: assignment.title,
      points: assignment.points,
      due: assignment.due,
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to get assignment by Id" });
  }
});

router.post("/", requiredInBody(["courseId", "title", "points", "due"]), requireAuthentication({
    role: "instructor",
    filter: async req => {
        const courseId = req.body.courseId;
        const course = await Course.findById(courseId);
        if (!course) {
            return false;
        }
        const instructorId = course.instructorId.toString();
        const user = await User.findById(req.userId!);
        return user.role === "admin" || user.id === instructorId;
    }
}), async (req, res) => {
  const assignmentData = req.body
  const assignment = new Assignment(assignmentData);

    try {
      const id = await assignment.save();
      res.status(200).json({ id: id });
    } catch (error) {
      res.status(400).json({ message: "Failed to post assignment" });
    }
  },
);

export default router;
