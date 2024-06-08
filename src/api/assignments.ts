import { Router, Request, Response, NextFunction} from "express";
import { allowedInBody, requiredInBody } from "../util/middleware.js";
import { requireAuthentication } from "../util/authentication.js";
import { Course } from "../models/courses.js";
import { User } from "../models/users.js";
import { Assignment } from "../models/assignments.js";

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

router.patch("/:id", allowedInBody(["title", "points", "due"]), requireAuthentication({
    role: "instructor",
    filter: async req => {
        const assignmentId = req.params.id;
        const assignment = await Assignment.findById(assignmentId);
        if(!assignment) {
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
        res.status(200).json({message: "Updated assignment", assignment: assignment});

    } catch (error) {
        res.status(400).json({error: "Failed to update assignment"});
    }
});

router.get("/:id", async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const assignment = await Assignment.findById(assignmentId)
    res.status(200).json({
        courseId: assignment.courseId,
        title: assignment.title,
        points: assignment.points,
        due: assignment.due,
    });
    } catch (error) {
        res.status(400).json({error: "Failed to get assignment by Id"});
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
  const assignmentData = req.body;

  const assignment = new Assignment(assignmentData);

  try {
    const id = await assignment.save();
    res.status(200).json({id: id,});
  } catch (error) {
    res.status(400).json({message: "Failed to post assignment"});
  }
});

export default router;
