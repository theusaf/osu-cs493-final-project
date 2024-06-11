import { describe, test } from "node:test";
import assert from "node:assert";
import { displayFetch, API_BASE, fetchIgnoreRatelimit } from "../index.js";

let instructorToken = "";
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

describe("Instructor", async () => {
  await test("Instructor User Exists", async () => {
    const response = await fetchIgnoreRatelimit(
      displayFetch,
      `${API_BASE}/users/login`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email: "shinomiyak@oregonstate.edu",
          password: "ohkawaii",
        }),
      },
    );
    const data = await response.json();
    assert.strictEqual(typeof data.token, "string");
    instructorToken = data.token;
  });

  await test("Fetch specific user data", async () => {
    const userId = "1"; // Can be replaced with any user id
    const response = await displayFetch(`${API_BASE}/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`,
      },
      method: "GET",
    });
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.name, "Kaguya Shinomiya");
    assert.strictEqual(data.email, "shinomiyak@oregonstate.edu");
    assert.strictEqual(data.role, "instructor");
    assert.ok(Array.isArray(data.courses));
    // See courses.json for more details
    assert.ok(data.courses.includes("206"));
    assert.ok(!data.courses.includes("201"));
  });

  await test("Fetch all courses", async () => {
    const response = await displayFetch(`${API_BASE}/courses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`,
      },
      method: "GET",
    });
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data.courses));
  });

  await test("Create a new course (should fail for instructor)", async () => {
    const response = await displayFetch(`${API_BASE}/courses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`,
      },
      method: "POST",
      body: JSON.stringify({
        title: "Student Council Activities",
        description: "I will teach you all how to run a student council. ",
        instructorId: "1",
      }),
    });
    assert.strictEqual(response.status, 403); // Not admin user = forbidden
  });

  await test("Fetch specific course data", async () => {
    const courseId = "205";
    const response = await displayFetch(`${API_BASE}/courses/${courseId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`,
      },
      method: "GET",
    });
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.id, courseId);
    assert.ok(!data.students);
    assert.ok(!data.assignments);
  });

  await test("Update specific course data", async () => {
    const courseId = "206"; // Replace this with a course id? Want to replace with the course created.
    const response = await displayFetch(`${API_BASE}/courses/${courseId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`,
      },
      method: "PATCH",
      body: JSON.stringify({
        title: "Updated Course Title from Student Council Activities",
      }),
    });
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(
      data.title,
      "Updated Course Title from Student Council Activities",
    );
  });

  await test("Fetch list of students enrolled in a course", async () => {
    const courseId = "206";
    const response = await displayFetch(
      `${API_BASE}/courses/${courseId}/students`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "GET",
      },
    );
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data.students));
  });

  await test("Update enrollment for a course", async () => {
    let courseId;
    // Create a course for testing
    {
      // Create a course
      const response = await displayFetch(`${API_BASE}/courses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          title: "Test",
          instructorId: "1",
          subject: "CS",
          number: "101",
          term: "Fall",
        }),
      });
      const data = await response.json();
      courseId = data.id;
    }
    // Add students to the course
    const response = await displayFetch(
      `${API_BASE}/courses/${courseId}/students`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          add: ["202", "203"],
        }),
      },
    );
    assert.strictEqual(response.status, 200);
    const courseResponse = await displayFetch(
      `${API_BASE}/courses/${courseId}/students`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      },
    );
    const data = await courseResponse.json();
    assert.ok(Array.isArray(data.students));
    assert.ok(
      data.students.some(
        (student) => student.email === "shane@oregonstate.edu",
      ),
    );
    assert.ok(
      data.students.some(
        (student) => student.email === "doejohn@oregonstate.edu",
      ),
    );
    const response2 = await displayFetch(
      `${API_BASE}/courses/${courseId}/students`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          remove: ["202"],
        }),
      },
    );
    assert.strictEqual(response2.status, 200);
    const courseResponse2 = await displayFetch(
      `${API_BASE}/courses/${courseId}/students`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      },
    );
    const data2 = await courseResponse2.json();
    assert.ok(Array.isArray(data2.students));
    assert.ok(
      !data2.students.some(
        (student) => student.email === "shane@oregonstate.edu",
      ),
    );
    assert.ok(
      data2.students.some(
        (student) => student.email === "doejohn@oregonstate.edu",
      ),
    );
  });

  await test("Fetch CSV file Roster", async () => {
    const courseId = "206";
    const response = await displayFetch(
      `${API_BASE}/courses/${courseId}/roster`,
      {
        headers: {
          "Content-Type": "text/csv",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "GET",
      },
    );
    const data = await response.text();
    assert.strictEqual(response.status, 200);
    const lines = data.split("\n");
    const headers = lines[0].split(",");
    assert.ok(
      ['"id"', '"name"', '"email"'].every((field) => headers.includes(field)),
    );
  });

  await test("Fetch list of assignments in a course", async () => {
    const courseId = "206";
    const response = await displayFetch(
      `${API_BASE}/courses/${courseId}/assignments`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "GET",
      },
    );
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data.assignments));
  });

  let createdAssignmentId;

  await test("Create a new assignment", async () => {
    const courseId = "206";
    const response = await displayFetch(`${API_BASE}/assignments`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`,
      },
      method: "POST",
      body: JSON.stringify({
        title: "New Assignment for lazy",
        courseId: courseId,
        due: "2024-12-31",
        points: "20",
      }),
    });
    const data = await response.json();
    assert.strictEqual(response.status, 201);
    assert.strictEqual(typeof data.id, "string");
    createdAssignmentId = data.id;
  });

  await test("Fetch specific assignment data", async () => {
    const assignmentId = createdAssignmentId; // assignmentIds
    const response = await displayFetch(
      `${API_BASE}/assignments/${assignmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "GET",
      },
    );
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.courseId, "206");
    assert.strictEqual(data.title, "New Assignment for lazy");
    assert.strictEqual(data.due, "2024-12-31");
    assert.strictEqual(data.points, "20");
    assert.ok(!data.submissions);
  });

  await test("Update specific assignment data", async () => {
    const assignmentId = createdAssignmentId;
    const response = await displayFetch(
      `${API_BASE}/assignments/${assignmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "PATCH",
        body: JSON.stringify({
          title: "Updated Assignment Title",
        }),
      },
    );
    const data = await response.json();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.title, "Updated Assignment Title");
  });

  await test("Delete specific assignment", async () => {
    const assignmentId = createdAssignmentId;
    const response = await displayFetch(
      `${API_BASE}/assignments/${assignmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${instructorToken}`,
        },
        method: "DELETE",
      },
    );
    assert.strictEqual(response.status, 204); //204 no return content
  });
});
