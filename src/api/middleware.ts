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

export { requiredInBody };