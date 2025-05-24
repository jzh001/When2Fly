const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

const userId = "test-notif-user";
const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Notification Controller Endpoints", () => {
    let server;

    beforeAll((done) => {
        server = app.listen(4010, () => done());
    });

    afterAll(async () => {
        await db.from("notifications").delete().eq("google_id", userId);
        server.close();
    });

    it("should return an empty array if there are no notifications", async () => {
        await db.from("notifications").delete().eq("google_id", userId);

        const res = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should fetch unread notifications for the logged-in user", async () => {
        // Insert a test notification
        const notif = {
            google_id: userId,
            message: "Test notification",
            isRead: false,
            created_at: new Date().toISOString()
        };
        await db.from("notifications").insert([notif]);

        const res = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).toHaveProperty("message", "Test notification");
        expect(res.body[0]).toHaveProperty("created_at");
    });

    it("should not return notifications that are marked as read", async () => {
        // Insert a read notification
        const notif = {
            google_id: userId,
            message: "Read notification",
            isRead: true,
            created_at: new Date().toISOString()
        };
        await db.from("notifications").insert([notif]);

        const res = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.find(n => n.message === "Read notification")).toBeUndefined();
    });

    it("should mark a notification as read", async () => {
        // Insert an unread notification
        const notif = {
            google_id: userId,
            message: "Mark as read notification",
            isRead: false,
            created_at: new Date().toISOString()
        };
        const { data } = await db.from("notifications").insert([notif]).select();
        const notifId = data[0].id;

        // Mark as read
        const res = await request(app)
            .post(`/notifications/read/${notifId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Notification marked as read");

        // Confirm it no longer appears in unread notifications
        const unreadRes = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(unreadRes.body.find(n => n.id === notifId)).toBeUndefined();
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app)
            .get("/notifications");

        expect(res.statusCode).toBe(401);
    });
});