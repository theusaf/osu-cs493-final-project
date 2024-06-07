import { Router, Request, Response, NextFunction} from "express";
import {collection} from "firebase/firestore";
import { requiredInBody } from "../util/middleware.js";
import { requireAuthentication } from "../util/authentication.js";

const router = Router();

router.post('/assignments', requireAuthentication, requiredInBody(["courseID", "title", "points", "due"]), (req: Request, res: Response) => {
    //const assignmentsCollection = collection(db, 'Assignments');
    //select course from courseID
    //compare req.user to course teacher ID
    return res.status(200);

});

router.get('/assignments/:id', (req: Request, res: Response) => {

    return res.status(200);
});

router.patch('/assignments/:id', (req: Request, res: Response) => {

    return res.status(200);
})

export default router;
