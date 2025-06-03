const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

describe("Notification Controller Endpoints", () => {
    let server;
    const user1 = {
        userId: "user1-id",
        name: "Test User 1",
        email: "test1@g.ucla.edu"
    };
    const user2 = {
        userId: "user2-id",
        name: "Test User 2",
        email: "test2@g.ucla.edu"
    };

    const token1 = jwt.sign({ userId: user1.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const token2 = jwt.sign({ userId: user2.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

    beforeAll(async () => {
        server = app.listen(4010);
        // Create test users
        await db.from("users").upsert([
            { google_id: user1.userId, name: user1.name, email: user1.email },
            { google_id: user2.userId, name: user2.name, email: user2.email }
        ]);
    });

    afterAll(async () => {
        await db.from("notifications").delete().in("google_id", [user1.userId, user2.userId]);
        await db.from("users").delete().in("google_id", [user1.userId, user2.userId]);
        await db.from("flights").delete().in("userId", [user1.userId, user2.userId]); // Clean up flights for both users
        server.close();
    });

    beforeEach(async () => {
        await db.from("notifications").delete().in("google_id", [user1.userId, user2.userId]);
        await db.from("flights").delete().in("userId", [user1.userId, user2.userId]);
    });

    it("should handle two-way notifications between users", async () => {
        const baseTime = new Date();
        
        // User 2 creates a flight first
        const flight2 = {
            name: "User 2 Flight",
            time: new Date(baseTime.getTime() + 30 * 60 * 1000).toISOString() // 30 minutes after base time
        };

        await request(app)
            .post("/flights")
            .set("Authorization", `Bearer ${token2}`)
            .send(flight2);

        // User 1 creates a flight within 2 hours of User 2's flight
        const flight1 = {
            name: "User 1 Flight",
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
        expect(user2Notifications.body.length).toBeGreaterThan(0);
        expect(user2Notifications.body[0]).toEqual(expect.objectContaining({
            message: `A new flight "User 1 Flight" was added within 2 hours of your flight by ${user1.name} (${user1.email}).`,
            created_at: expect.any(String)
        }));

        // Check that User 1 got notified about User 2's flight
        const user1Notifications = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token1}`);

        expect(user1Notifications.statusCode).toBe(200);
        expect(user1Notifications.body.length).toBeGreaterThan(0);
        
        const expectedMessage = `User ${user2.name} (${user2.email}) has a flight "User 2 Flight" within 2 hours of your new flight.`;
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

        // Confirm it is now marked as read
        const unreadRes = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token1}`);

        const updatedNotif = unreadRes.body.find(n => n.id === notifId);
        expect(updatedNotif).toBeDefined();
        expect(updatedNotif.isRead).toBe(true);
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app)
            .get("/notifications");

        expect(res.statusCode).toBe(401);
    });
});