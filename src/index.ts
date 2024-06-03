import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assignmentsRouter from "./api/assignments.js";
import coursesRouter from "./api/courses.js";
import usersRouter from "./api/users.js";
import express, { ErrorRequestHandler } from "express";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env.local") });

const app = express();

// Middleware
app.use(express.json());

// Rate-Limiting Middleware
app.use((req, res, next) => {
  // TOOD: Implement
  next();
});

// Main Routes
app.use(assignmentsRouter);
app.use(coursesRouter);
app.use(usersRouter);

// Fallback and Error Routes
app.use(((err, _req, res, _next) => {
  res.status(500).json({ message: err.message });
}) as ErrorRequestHandler);

app.listen(process.env.PORT ?? 3000, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
});
