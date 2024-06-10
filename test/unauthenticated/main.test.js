import { describe, test } from "node:test";
import assert from "node:assert";
import { displayFetch, API_BASE, fetchIgnoreRatelimit } from "../index.js";

describe("Unauthenticated", () => {
  describe("can be rate-limited", async () => {
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(fetch(API_BASE));
    }
    const data = await Promise.all(promises);
    assert.strictEqual(
      data.some((response) => response.status === 429),
      true,
    );
  });

  describe("using user api", () => {
    test("cannot get user data", async () => {
      const response = await fetchIgnoreRatelimit(
        displayFetch,
        `${API_BASE}/users/1`,
      );
      assert.strictEqual(response.status, 403);
    });

    test("can create a new student user", async () => {
      const response = await fetchIgnoreRatelimit(
        displayFetch,
        `${API_BASE}/users`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            name: "test",
            email: "test@example.com",
            password: "password",
            role: "student",
          }),
        },
      );
      const data = await response.json();
      assert.strictEqual(response.status, 201);
      assert.strictEqual(typeof data.id, "string");
    });

    test("cannot create a new instructor user", async () => {
      const response = await fetchIgnoreRatelimit(
        displayFetch,
        `${API_BASE}/users`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            name: "test",
            email: "test@example.com",
            password: "password",
            role: "instructor",
          }),
        },
      );
      const data = await response.json();
      assert.strictEqual(response.status, 403);
      assert.strictEqual(typeof data.error, "string");
    });
  });

  describe("using course api", () => {
    test("can retrieve all courses", async () => {
      const response = await fetchIgnoreRatelimit(
        displayFetch,
        `${API_BASE}/courses`,
      );
      const data = await response.json();
      assert.strictEqual(response.status, 200);
      assert.ok(Array.isArray(data.courses));
      assert.ok(
        data.courses.every((course) => {
          return (
            typeof course.id === "string" &&
            typeof course.title === "string" &&
            typeof course.subject === "string" &&
            typeof course.number === "string" &&
            typeof course.term === "string" &&
            typeof course.instructorId === "string" &&
            typeof course.studentIds === "undefined"
          );
        }),
      );
    });
  });
});
