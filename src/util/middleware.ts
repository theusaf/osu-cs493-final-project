import { Request, Response, NextFunction } from "express";

export function requiredInBody(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const attr of required) {
      if (!(attr in req.body)) {
        return res.status(400).json({ error: "Missing attributes" });
      }
    }
    next();
  };
}

export function allowedInBody(allowed: string[]) {
  return (req: Request, _: Response, next: NextFunction) => {
    for (const attr of req.body) {
      if (!(attr in allowed)) {
        delete req.body[attr];
      }
    }
    next();
  };
}
