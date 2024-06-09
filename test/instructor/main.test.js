import { describe, test } from "node:test";
import assert from "node:assert";
import { displayFetch, API_BASE } from "../index.js";

let instructorToken = "";

describe("Instructor", async () => {
  await test("Instructor User Exists", async () => {
    const response = await displayFetch(`${API_BASE}/users/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: "shinomiyak@oregonstate.edu",
        password: "ohkawaii",
      }),
    });
    const data = await response.json();
    assert.strictEqual(typeof data.token, "string");
    instructorToken = data.token;
  });

  await test("Fetch specific user data", async () => {
    const userId = "1"; // Can be replaced with any user id
    const response = await displayFetch(`${API_BASE}/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${instructorToken}`
      },
      method: "GET"
    });
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.id, userId);
    assert.strictEqual(data.role, "instructor");
    assert.ok(Array.isArray(data.courses));
  });

});