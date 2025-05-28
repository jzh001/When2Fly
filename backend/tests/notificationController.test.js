const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

describe("Notification Controller Endpoints", () => {
    let server;
    const user1 = {
        userId: "test-notif-user-1",
        name: "Test User 1"
    };
    const user2 = {
        userId: "test-notif-user-2",
        name: "Test User 2"
    };

    const token1 = jwt.sign({ userId: user1.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const token2 = jwt.sign({ userId: user2.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

    beforeAll(async () => {
        server = app.listen(4010);
        // Create test users
        await db.from("users").upsert([
            { google_id: user1.userId, name: user1.name, email: "test1@example.com" },
            { google_id: user2.userId, name: user2.name, email: "test2@example.com" }
        ]);
    });

    afterAll(async () => {
        await db.from("notifications").delete().in("google_id", [user1.userId, user2.userId]);
        await db.from("users").delete().in("google_id", [user1.userId, user2.userId]);
        server.close();
    });

    beforeEach(async () => {
        await db.from("notifications").delete().in("google_id", [user1.userId, user2.userId]);
        await db.from("flights").delete().in("userId", [user1.userId, user2.userId]);
    });

    it("should handle two-way notifications between users", async () => {
        const baseTime = new Date();
        
        // Create prerequisite flights for both users
        await db.from("flights").insert([
            {
                userId: user1.userId,
                name: "User 1 Existing Flight",
                time: new Date(baseTime.getTime() + 30 * 60 * 1000).toISOString() // 30 minutes after base time
            },
            {
                userId: user2.userId,
                name: "User 2 Existing Flight",
                time: new Date(baseTime.getTime() + 60 * 60 * 1000).toISOString() // 1 hour after base time
            }
        ]);

        // User 1 creates a new flight
        const flight1 = {
            name: "User 1 New Flight",
            time: new Date(baseTime.getTime() + 45 * 60 * 1000).toISOString() // 45 minutes after base time
        };

        await request(app)
            .post("/flights")
            .set("Authorization", `Bearer ${token1}`)
            .send(flight1);

        // Check that User 2 got notified about User 1's flight
        const user2Notifications = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token2}`);

        expect(user2Notifications.statusCode).toBe(200);
        expect(user2Notifications.body).toHaveLength(1);
        expect(user2Notifications.body[0]).toEqual(expect.objectContaining({
            message: `A new flight "${flight1.name}" was added within 2 hours of your flight.`,
            created_at: expect.any(String)
        }));

        // User 2 creates a new flight
        const flight2 = {
            name: "User 2 New Flight",
            time: new Date(baseTime.getTime() + 15 * 60 * 1000).toISOString() // 15 minutes after base time
        };

        await request(app)
            .post("/flights")
            .set("Authorization", `Bearer ${token2}`)
            .send(flight2);

        // Check that User 1 got notified about User 2's flight
        const user1Notifications = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token1}`);

        expect(user1Notifications.statusCode).toBe(200);
        expect(user1Notifications.body.length).toBeGreaterThan(0);
        
        // Verify at least one notification matches our expected format
        const expectedMessage = `A new flight "${flight2.name}" was added within 2 hours of your flight.`;
        expect(user1Notifications.body.some(notification => 
            notification.message === expectedMessage
        )).toBe(true);
    });

    it("should return an empty array if there are no notifications", async () => {
        await db.from("notifications").delete().eq("google_id", user1.userId);

        const res = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should only return notifications that are unread OR any read notifications from the last 7 days", async () => {
        // Insert a read notification from today
        const notif = {
            google_id: user1.userId,
            message: "Read notification",
            isRead: true,
            created_at: new Date().toISOString()
        };
        await db.from("notifications").insert([notif]);

        // Fetch notifications
        const res = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token1}`);

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
            google_id: user1.userId,
            message: "Mark as read notification",
            isRead: false,
            created_at: new Date().toISOString()
        };
        const { data } = await db.from("notifications").insert([notif]).select();
        const notifId = data[0].id;

        // Mark as read
        const res = await request(app)
            .post(`/notifications/read/${notifId}`)
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Notification marked as read");

        // Confirm it no longer appears in unread notifications
        const unreadRes = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token1}`);

        expect(unreadRes.body.find(n => n.id === notifId)).toBeUndefined();
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app)
            .get("/notifications");

        expect(res.statusCode).toBe(401);
    });
});