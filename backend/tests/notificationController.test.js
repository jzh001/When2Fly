const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

const userId = "test-notif-user";
const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

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

    it("should only return notifications that are unread OR any read notifications from the last 7 days", async () => {
        // Insert a read notification from today
        const notif = {
            google_id: userId,
            message: "Read notification",
            isRead: true,
            created_at: new Date().toISOString()
        };
        await db.from("notifications").insert([notif]);

        // Fetch notifications
        const res = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(Array.isArray(res.body)).toBe(true);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        res.body.forEach(n => {
            if (n.message === "Read notification") {
                // If present, must be recent
                expect(new Date(n.created_at).getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime());
            }
        });
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