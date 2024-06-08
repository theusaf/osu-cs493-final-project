import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

import assignmentsRouter from "./api/assignments.js";
import coursesRouter from "./api/courses.js";
import usersRouter from "./api/users.js";
import express, { ErrorRequestHandler } from "express";
import { withAuthenticated } from "./util/authentication.js";
import { ratelimit } from "./util/ratelimit.js";
import { initDatabase } from "./initDatabase.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(withAuthenticated);

// Rate-Limiting Middleware
app.use(ratelimit);

// Main Routes
app.use("/assignments", assignmentsRouter);
app.use("/courses", coursesRouter);
app.use("/users", usersRouter);

// Fallback and Error Routes
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use(((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
}) as ErrorRequestHandler);

await initDatabase();

app.listen(process.env.PORT ?? 3000, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
});
