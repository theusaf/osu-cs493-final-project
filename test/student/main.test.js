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
});
