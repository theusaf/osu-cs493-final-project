import { describe, test } from "node:test";
import assert from "node:assert";
import { displayFetch, API_BASE } from "../index.js";

let studentToken = "";

describe("Student", async () => {
  await test("Student User Exists", async () => {
    const response = await displayFetch(`${API_BASE}/users/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: "shane@oregonstate.edu",
        password: "school",
      }),
    });
    const data = await response.json();
    assert.strictEqual(typeof data.token, "string");
    studentToken = data.token;
  });

  await test("Fetch specific user data", async () => {
    const userId = "202"; // Can be replaced with any user id
    const response = await displayFetch(`${API_BASE}/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      method: "GET",
    });
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.name, "Shane Ludwig");
    assert.strictEqual(data.email, "shane@oregonstate.edu");
    assert.strictEqual(data.role, "student");
    assert.deepEqual(data.courses, []);
    assert.ok(Array.isArray(data.courses));
  });

  await test("Create a new submission for an assignment", async () => {
    const assignmentId = "7";
    const form = new FormData();
    form.append(
      "file",
      new Blob(["Hello, World!"], { type: "image/png" }),
      "example.png",
    );
    form.append("timestamp", "2024-06-09T12:00:00Z");
    form.append("assignmentId", assignmentId);
    form.append("studentId", "202");
    const response = await displayFetch(
      `${API_BASE}/assignments/${assignmentId}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
        method: "POST",
        body: form,
      },
    );
    const data = await response.json();
    assert.strictEqual(response.status, 201);
    assert.strictEqual(typeof data.id, "string");
  });
});
