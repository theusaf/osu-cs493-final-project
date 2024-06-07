import { Router, Request, Response, NextFunction} from "express";

function requiredInBody(required: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const attr of required) {
            if (!(attr in req.body)) {
                return res.status(400).json({"error": "Missing attributes"});
            }
        }
        next();
    };
}

function allowedInBody(required: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        for (var attr of req.body) {
            if (!(attr in required)) {
                delete req.body[attr];
            }
        }
        next();
    };
}
export { requiredInBody, allowedInBody };