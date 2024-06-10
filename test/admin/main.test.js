import { describe, test } from "node:test";
import assert from "node:assert";
import { displayFetch, API_BASE, fetchIgnoreRatelimit } from "../index.js";

let adminToken = "";

describe("Admin", async () => {
  await test("Admin User Exists", async () => {
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
    assert.strictEqual(typeof data.token, "string");
    adminToken = data.token;
  });

  test("Logging in with wrong password fails", async () => {
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
          password: "wrongpassword",
        }),
      },
    );
    const data = await response.json();
    assert.strictEqual(response.status, 401);
    assert.strictEqual(typeof data.error, "string");
  });

  describe("Create a new user", () => {
    test("Can create an admin user", async () => {
      const response = await displayFetch(`${API_BASE}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          name: "test",
          email: "testing@example.com",
          password: "password",
          role: "admin",
        }),
      });
      const data = await response.json();
      assert.strictEqual(response.status, 201);
      assert.strictEqual(typeof data.id, "string");
    });

    test("Can create an instructor user", async () => {
      const response = await displayFetch(`${API_BASE}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          name: "test",
          email: "testing@example.com",
          password: "password",
          role: "instructor",
        }),
      });
      const data = await response.json();
      assert.strictEqual(response.status, 201);
      assert.strictEqual(typeof data.id, "string");
    });

    test("Can create an student user", async () => {
      const response = await displayFetch(`${API_BASE}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          name: "test",
          email: "testing@example.com",
          password: "password",
          role: "student",
        }),
      });
      const data = await response.json();
      assert.strictEqual(response.status, 201);
      assert.strictEqual(typeof data.id, "string");
    });
  });
});
