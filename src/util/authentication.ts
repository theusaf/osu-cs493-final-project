import argon2 from "argon2";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, UserType } from "../models/users.js";

/**
 * Hashes a plaintext password.
 *
 * @param plaintext
 * @returns The hash of the plaintext password.
 */
export function hash(plaintext: string): Promise<string> {
  return argon2.hash(plaintext);
}

/**
 * Verifies a plaintext password against a hash.
 *
 * @param hash The hash.
 * @param plaintext The plaintext password.
 * @returns Whether the password is correct.
 */
export function verify(hash: string, plaintext: string): Promise<boolean> {
  return argon2.verify(hash, plaintext);
}

/**
 * Creates a session token for a user.
 *
 * @param userId The user ID.
 * @returns The session token.
 */
export function createSessionToken(userId: string): string {
  const payload = {
    sub: userId,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
}

export function extractSession(req: Request): string | null {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return null;
  }
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer") {
    return null;
  }
  try {
    return (
      (jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload).sub ?? null
    );
  } catch (error) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string | null;
}

/**
 * Middleware to read the user's session token and add the user ID to the request.
 *
 * @param req
 * @param _
 * @param next
 */
export function withAuthenticated(
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction,
) {
  const userId = extractSession(req);
  if (userId) req.userId = userId;
  next();
}

type Awaitable<T> = T | Promise<T>;

/**
 * Middleware to require authentication. Upon failure, responds with a 403 Forbidden response.
 *
 * @param opts
 */
export function requireAuthentication(opts?: {
  role?: UserType["role"] | UserType["role"][];
  filter?: (req: AuthenticatedRequest) => Awaitable<boolean>;
}) {
  const { role, filter } = opts ?? {};
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const sendError = () => {
      res.status(403).send({
        error: "Unauthorized",
      });
    };

    if (!req.userId) return sendError();
    const user = await User.findById(req.userId);
    if (!user) return sendError();
    if (user.role !== "admin") {
      if (role) {
        if (Array.isArray(role)) {
          if (!role.includes(user.role)) return sendError();
        } else {
          if (role !== user.role) return sendError();
        }
      }
      if (filter) {
        if (!(await filter(req))) return sendError();
      }
    }
    next();
  };
}
