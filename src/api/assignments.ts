import { Router, Request, Response, NextFunction} from "express";
import {collection} from "firebase/firestore";
import {db} from "./firebaseConfig";
import { requiredInBody } from "./middleware.js";

const router = Router();

router.post('/assignments', requiredInBody(["courseID", "title", "points", "due"]), (req: Request, res: Response) => {
    const assignmentsCollection = collection(db, 'Assignments');

})

export default router;
