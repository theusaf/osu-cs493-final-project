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

export interface PartiallyAuthenticatedRequest extends Request {
  userId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: User;
}

/**
 * Middleware to read the user's session token and add the user ID to the request.
 */
export function withAuthenticated(
  req: PartiallyAuthenticatedRequest,
  _: Response,
  next: NextFunction,
) {
  const userId = extractSession(req);
  if (userId) req.userId = userId;
  next();
}

type Awaitable<T> = T | Promise<T>;

interface RequireAuthenticatedOptions {
  /**
   * The role(s) required to access the route.
   */
  role?: UserType["role"] | UserType["role"][];

  /**
   * A function to filter requests based on additional criteria.
   *
   * @param req The request.
   * @returns Whether the request is allowed.
   */
  filter?: (req: AuthenticatedRequest) => Awaitable<boolean>;
}

/**
 * Middleware to require authentication. Upon failure, responds with a 403 Forbidden response.
 *
 * If needing to accept requests where authentication is optional, use custom middleware or logic instead.
 *
 * @param opts Options for the middleware. If omitted, only requires the user to be authenticated.
 */
export function requireAuthentication(opts?: RequireAuthenticatedOptions) {
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
    req.user = user;
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
