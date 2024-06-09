import { describe, test } from "node:test";
import assert from "node:assert";
import { displayFetch, API_BASE } from "../index.js";

describe("Admin", () => {
  test("Admin User Exists", async () => {
    const response = await displayFetch(`${API_BASE}/users/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: "hubbardjill@oregonstate.edu",
        password: "admin",
      }),
    });
    const data = await response.json();
    assert.strictEqual(typeof data.token, "string");
  });
});
