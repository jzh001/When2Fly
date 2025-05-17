const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

describe("User Controller Endpoints", () => {
    let server;
    let testUser;
    let token;

    beforeAll(async () => {
        server = app.listen(4020);
        // Optionally wait a moment for the server to start
        await new Promise(res => setTimeout(res, 200));
        // Create a test user in the database
        const { data } = await db.from("users").insert([
            { google_id: "test-google-id", name: "Old Name", email: "testuser@example.com" }
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
});