const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

describe("User Controller Endpoints", () => {
    let server;
    let testUser;
    let token;
    let currentName = "Old Name";

    beforeAll(async () => {
        server = app.listen(4020);
        // Optionally wait a moment for the server to start
        await new Promise(res => setTimeout(res, 200));
        // Create a test user in the database
        const { data } = await db.from("users").insert([
            { google_id: "test-google-id", name: currentName, email: "testuser@example.com" }
        ]).select();
        testUser = data[0];
        token = jwt.sign({ id: testUser.google_id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    });

    afterAll(async () => {
        await db.from("users").delete().eq("google_id", testUser.google_id);
        server.close();
    });

    it("should update the user's name", async () => {
        const res = await request(app)
            .put("/users/update-name")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: testUser.google_id, newName: "New Name" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("New Name");

        currentName = "New Name"; // Track the latest name

        // Confirm in DB
        const { data: updatedArr } = await db.from("users").select("*").eq("google_id", testUser.google_id);
        expect(updatedArr[0].name).toBe("New Name");
    });

    it("should return 400 if required fields are missing", async () => {
        const res = await request(app)
            .put("/users/update-name")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: testUser.google_id });

        expect(res.statusCode).toBe(400);
    });

    it("should return 404 if user does not exist", async () => {
        const res = await request(app)
            .put("/users/update-name")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: "nonexistent-id", newName: "Doesn't Matter" });

        expect(res.statusCode).toBe(404);
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app)
            .put("/users/update-name")
            .send({ userId: testUser.google_id, newName: "No Auth" });

        expect(res.statusCode).toBe(401);
    });

    it("should return the current user's info when authenticated", async () => {
        const res = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("google_id", testUser.google_id);
        expect(res.body).toHaveProperty("name", currentName); // Use currentName here
        expect(res.body).toHaveProperty("email", testUser.email);
    });

    it("should return 401 if no token is provided for getCurrentUser", async () => {
        const res = await request(app)
            .get("/users");

        expect(res.statusCode).toBe(401);
    });
        it("should update the user's timezone", async () => {
        const newTimezone = "Asia/Shanghai";
        const res = await request(app)
            .put("/users/update-timezone")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: testUser.google_id, timezone: newTimezone });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Confirm in DB
        const { data: updatedArr } = await db.from("users").select("*").eq("google_id", testUser.google_id);
        expect(updatedArr[0].timezone).toBe(newTimezone);

        // Clean up: reset timezone to UTC
        await db.from("users").update({ timezone: "UTC" }).eq("google_id", testUser.google_id);
    });

    it("should return 400 if required fields are missing for timezone update", async () => {
        const res = await request(app)
            .put("/users/update-timezone")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: testUser.google_id });

        expect(res.statusCode).toBe(400);
    });

    it("should return 401 if no token is provided for timezone update", async () => {
        const res = await request(app)
            .put("/users/update-timezone")
            .send({ userId: testUser.google_id, timezone: "UTC" });

        expect(res.statusCode).toBe(401);
    });
});