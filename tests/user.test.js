const request = require("supertest");
const app = require("../src/app");

describe("User API", () => {
  it("creates a user with valid data", async () => {
    const res = await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("jane@example.com");
  });

  it("rejects invalid email", async () => {
    const res = await request(app).post("/users").send({
      name: "Bad Email",
      email: "not-an-email",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Valid email is required");
  });
});
