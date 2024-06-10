import { describe, test } from "node:test";
import assert from "node:assert";
import { displayFetch, API_BASE, fetchIgnoreRatelimit } from "../index.js";

let adminToken = "";

{
  const response = await fetchIgnoreRatelimit(
    displayFetch,
    `${API_BASE}/users/login`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: "hubbardjill@oregonstate.edu",
        password: "admin",
      }),
    },
  );
  const data = await response.json();
  adminToken = data.token;
}

describe("Invalid data", async () => {
  describe("user api", () => {
    test("Create a new user with invalid data", async () => {
      const response = await displayFetch(`${API_BASE}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          name: "test",
          email: true,
          password: "password",
        }),
      });
      const data = await response.json();
      assert.strictEqual(response.status, 400);
      assert.strictEqual(typeof data.error, "string");
    });

    test("Loggin in with invalid data fails", async () => {
      const response = await fetchIgnoreRatelimit(
        displayFetch,
        `${API_BASE}/users/login`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            email: true,
            password: "password",
          }),
        },
      );
      const data = await response.json();
      assert.strictEqual(response.status, 400);
      assert.strictEqual(typeof data.error, "string");
    });
  });

  describe("course api", () => {
    test("Create a new course with invalid data fails", async () => {
      const response = await displayFetch(`${API_BASE}/courses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          name: "test",
          code: "test",
          instructor: "test",
          term: "test",
          year: "test",
        }),
      });
      const data = await response.json();
      assert.strictEqual(response.status, 400);
      assert.strictEqual(typeof data.error, "string");
    });

    test("Update a course with invalid data fails", async () => {
      // first, create a course to test
      let courseId;
      {
        const response = await displayFetch(`${API_BASE}/courses`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          method: "POST",
          body: JSON.stringify({
            subject: "test",
            number: "123",
            title: "hello world",
            term: "test",
            instructorId: "1",
          }),
        });
        const data = await response.json();
        courseId = data.id;
      }

      const response = await displayFetch(`${API_BASE}/courses/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        method: "PATCH",
        body: JSON.stringify({
          name: "test",
          code: "test",
          instructor: "test",
          year: "test",
        }),
      });
      const data = await response.json();
      assert.strictEqual(response.status, 400);
      assert.strictEqual(typeof data.error, "string");
    });
  });
});
