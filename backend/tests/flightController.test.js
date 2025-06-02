const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

const userId = "dummy-user-id-12345";
const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

beforeAll(async () => {
    await db.from("users").insert([
        { google_id: userId, name: "Dummy User", email: "dummy@g.ucla.edu" }
    ]);
});

// Helper to freeze time for time-sensitive tests
const FIXED_NOW = new Date("2025-05-10T10:00:00.000Z");
const realDateNow = Date.now;
beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => FIXED_NOW.getTime());
});
afterAll(() => {
    global.Date.now = realDateNow;
});

describe("Flight Controller Endpoints", () => {
    let server;
    let flightId;

    beforeAll((done) => {
        server = app.listen(4000, () => {
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    it("should fetch all flights for the logged-in user", async () => {
        const res = await request(app)
            .get("/flights")
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("should create a new flight for the logged-in user", async () => {
        const flightData = {
            name: "Test Flight",
            time: "2025-05-10T10:00:00",
        };

        const res = await request(app)
            .post("/flights")
            .set("Authorization", `Bearer ${token}`)
            .send(flightData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe(flightData.name);
        expect(res.body.time).toBe(flightData.time);
        flightId = res.body.id;
    });

    it("should fetch a single flight by ID for the logged-in user", async () => {
        const res = await request(app)
            .get(`/flights/${flightId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id", flightId);
    });

    it("should update the flight for the logged-in user", async () => {
        const updatedFlightData = {
            name: "Updated Test Flight",
            time: "2025-05-11T12:00:00",
        };

        const res = await request(app)
            .put(`/flights/${flightId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedFlightData);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe(updatedFlightData.name);
        expect(res.body.time).toBe(updatedFlightData.time);
    });

    it("should delete the flight for the logged-in user", async () => {
        const res = await request(app)
            .delete(`/flights/${flightId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });

    it("should return 404 for a deleted flight", async () => {
        const res = await request(app)
            .get(`/flights/${flightId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });

    it("should return 401 Unauthorized for unauthenticated users trying to modify the table", async () => {
        const flightData = {
            name: "Unauthorized Flight",
            time: "2025-05-12T10:00:00",
        };

        const res = await request(app)
            .post("/flights")
            .send(flightData);

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({});
    });

    it("should fetch flights within a specific time range for the logged-in user", async () => {
        // Clean up flights before test
        const allFlights = await request(app)
            .get("/flights")
            .set("Authorization", `Bearer ${token}`);
        for (const flight of allFlights.body) {
            if (flight.name && flight.name.startsWith("Flight ")) {
                await request(app)
                    .delete(`/flights/${flight.id}`)
                    .set("Authorization", `Bearer ${token}`);
            }
        }
        // Set up flights: one before now, one at now, one in the future, one after the interval
        const now = new Date(Date.now());
        const beforeNow = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1 hour before now
        const atNow = now.toISOString();
        const inInterval = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour after now
        const afterInterval = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(); // 3 hours after now

        const flights = [
            { name: "Flight Before Now", time: beforeNow },
            { name: "Flight At Now", time: atNow },
            { name: "Flight In Interval", time: inInterval },
            { name: "Flight After Interval", time: afterInterval },
        ];

        for (const flight of flights) {
            const res = await request(app)
                .post("/flights")
                .set("Authorization", `Bearer ${token}`)
                .send(flight);
            expect(res.statusCode).toBe(201);
        }

        const query = {
            time: now.toISOString(),
            interval: 2, // 2 hours
        };

        const res = await request(app)
            .get(`/flights/queryTime?time=${query.time}&interval=${query.interval}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        // Only "Flight At Now" and "Flight In Interval" should be returned
        const returnedNames = res.body.map(f => f.name);
        expect(returnedNames).toEqual(
            expect.arrayContaining(["Flight At Now", "Flight In Interval"])
        );
        expect(returnedNames).not.toContain("Flight Before Now");
        expect(returnedNames).not.toContain("Flight After Interval");
    });

    it("should fetch all flights for a specific user", async () => {
        const testFlights = [
            { name: "User Flight 1", time: "2025-05-14T10:00:00Z" },
            { name: "User Flight 2", time: "2025-05-14T11:00:00Z" }
        ];

        for (const flight of testFlights) {
            const res = await request(app)
                .post("/flights")
                .set("Authorization", `Bearer ${token}`)
                .send(flight);
            expect(res.statusCode).toBe(201);
        }

        const res = await request(app)
            .get(`/flights/user/${userId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        expect(res.body.every(f => String(f.userId) === String(userId))).toBe(true);

        try {
            const allFlights = await request(app)
                .get("/flights")
                .set("Authorization", `Bearer ${token}`);

            for (const flight of allFlights.body) {
                if (flight.name.includes("User Flight")) {
                    await request(app)
                        .delete(`/flights/${flight.id}`)
                        .set("Authorization", `Bearer ${token}`);
                }
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    });

    it("should fetch all flights within a specific time range (all users)", async () => {
        // Clean up any existing Global Flights and "Flight In Interval" before test
        const allFlightsBefore = await request(app)
            .get("/flights")
            .set("Authorization", `Bearer ${token}`);
        for (const flight of allFlightsBefore.body) {
            if ((flight.name && flight.name.startsWith("Global Flight")) || flight.name === "Flight In Interval" || flight.name === "Flight At Now") {
                await request(app)
                    .delete(`/flights/${flight.id}`)
                    .set("Authorization", `Bearer ${token}`);
            }
        }

        const now = new Date(Date.now());
        const beforeNow = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        const atNow = now.toISOString();
        const inInterval = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        const afterInterval = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();

        const flights = [
            { name: "Global Flight Before Now", time: beforeNow },
            { name: "Global Flight At Now", time: atNow },
            { name: "Global Flight In Interval", time: inInterval },
            { name: "Global Flight After Interval", time: afterInterval },
        ];

        for (const flight of flights) {
            await request(app)
                .post("/flights")
                .set("Authorization", `Bearer ${token}`)
                .send(flight);
        }

        const query = {
            time: now.toISOString(),
            interval: 2, // 2 hours
        };

        const res = await request(app)
            .get(`/flights/allFlights?time=${query.time}&interval=${query.interval}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const returnedNames = res.body.map(f => f.name);
        expect(returnedNames).toEqual(
            expect.arrayContaining(["Global Flight At Now", "Global Flight In Interval"])
        );
        expect(returnedNames).not.toContain("Global Flight Before Now");
        expect(returnedNames).not.toContain("Global Flight After Interval");
    });

    it("should create two-way notifications with author name and email", async () => {
        // Cleanup: delete all flights for user1 and user2 and any test flights before test
        const user1 = { id: "user1-id", name: "Test User 1", email: "test1@g.ucla.edu" };
        const user2 = { id: "user2-id", name: "Test User 2", email: "test2@g.ucla.edu" };
        let token1 = jwt.sign({ userId: user1.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        let token2 = jwt.sign({ userId: user2.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        for (const t of [token1, token2, token]) {
            const allFlights = await request(app)
                .get("/flights")
                .set("Authorization", `Bearer ${t}`);
            for (const flight of allFlights.body) {
                await request(app)
                    .delete(`/flights/${flight.id}`)
                    .set("Authorization", `Bearer ${t}`);
            }
        }

        // Setup two users
        await db.from("users").insert([
            { google_id: user1.id, name: user1.name, email: user1.email },
            { google_id: user2.id, name: user2.name, email: user2.email }
        ]);
        token1 = jwt.sign({ userId: user1.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        token2 = jwt.sign({ userId: user2.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // User 2 creates a flight
        const flight2Res = await request(app)
            .post("/flights")
            .set("Authorization", `Bearer ${token2}`)
            .send({
                name: "User 2 Flight",
                time: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
            });
        expect(flight2Res.statusCode).toBe(201);
        const flight2 = flight2Res.body;

        // User 1 creates a flight within 2 hours of User 2's flight
        const flight1Res = await request(app)
            .post("/flights")
            .set("Authorization", `Bearer ${token1}`)
            .send({
                name: "User 1 New Flight",
                time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
            });
        expect(flight1Res.statusCode).toBe(201);
        const flight1 = flight1Res.body;

        // User 2 should get a notification about User 1's flight
        const user2Notifications = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token2}`);
        expect(user2Notifications.statusCode).toBe(200);
        expect(user2Notifications.body.some(n => n.message === `A new flight "${flight1.name}" was added within 2 hours of your flight by ${user1.name} (${user1.email}).`)).toBe(true);

        // User 1 should get a notification about User 2's flight
        const user1Notifications = await request(app)
            .get("/notifications")
            .set("Authorization", `Bearer ${token1}`);
        expect(user1Notifications.statusCode).toBe(200);
        expect(user1Notifications.body.some(n => n.message === `User ${user2.name} (${user2.email}) has a flight "${flight2.name}" within 2 hours of your new flight.`)).toBe(true);
    }, 15000); // Increase timeout to 15s
});