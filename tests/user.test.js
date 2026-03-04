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

  it("normalizes email and name on create", async () => {
    const res = await request(app).post("/users").send({
      name: "  Jane Doe  ",
      email: "  JANE@EXAMPLE.COM ",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("jane@example.com");
    expect(res.body.name).toBe("Jane Doe");
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

  it("rejects missing fields", async () => {
    const res = await request(app).post("/users").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Name is required");
    expect(res.body.errors).toContain("Valid email is required");
    expect(res.body.errors).toContain("Birthday must be an ISO 8601 date (YYYY-MM-DD)");
    expect(res.body.errors).toContain("Timezone must be a valid IANA timezone");
  });

  it("rejects invalid birthday and timezone", async () => {
    const res = await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-13-40",
      timezone: "Not/AZone"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Birthday must be an ISO 8601 date (YYYY-MM-DD)");
    expect(res.body.errors).toContain("Timezone must be a valid IANA timezone");
  });

  it("rejects duplicate emails", async () => {
    await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    const res = await request(app).post("/users").send({
      name: "Jane Two",
      email: "jane@example.com",
      birthday: "1991-05-10",
      timezone: "America/New_York"
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("Email already exists");
  });

  it("lists users", async () => {
    await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    const res = await request(app).get("/users");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].email).toBe("jane@example.com");
  });

  it("gets a user by id", async () => {
    const createRes = await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    const res = await request(app).get(`/users/${createRes.body._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("jane@example.com");
  });

  it("returns 404 for missing user", async () => {
    const res = await request(app).get("/users/64d0b7c56c4c6e0c4b1f0000");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("updates a user", async () => {
    const createRes = await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    const res = await request(app)
      .put(`/users/${createRes.body._id}`)
      .send({ name: "  Jane Updated  ", email: "JANE.UPDATED@EXAMPLE.COM" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Jane Updated");
    expect(res.body.email).toBe("jane.updated@example.com");
  });

  it("validates update payload", async () => {
    const createRes = await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    const res = await request(app)
      .put(`/users/${createRes.body._id}`)
      .send({ email: "bad-email", timezone: "Invalid/Zone" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Email must be valid");
    expect(res.body.errors).toContain("Timezone must be a valid IANA timezone");
  });

  it("returns 404 on update for missing user", async () => {
    const res = await request(app)
      .put("/users/64d0b7c56c4c6e0c4b1f0000")
      .send({ name: "Someone" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("deletes a user", async () => {
    const createRes = await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      birthday: "1990-05-10",
      timezone: "America/New_York"
    });

    const res = await request(app).delete(`/users/${createRes.body._id}`);

    expect(res.statusCode).toBe(204);
  });

  it("returns 404 on delete for missing user", async () => {
    const res = await request(app).delete("/users/64d0b7c56c4c6e0c4b1f0000");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });
});
