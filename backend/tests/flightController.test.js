const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const db = require("../db");

const userId = "dummy-user-id-12345";
const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

beforeAll(async () => {
    await db.from("users").insert([
        { google_id: userId, name: "Dummy User", email: "dummy@example.com" }
    ]);
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
        const flights = [
            { name: "Flight 1", time: "2025-05-13T10:00:00Z" },
            { name: "Flight 2", time: "2025-05-13T12:00:00Z" },
            { name: "Flight 3", time: "2025-05-13T14:00:00Z" },
        ];

        for (const flight of flights) {
            const res = await request(app)
                .post("/flights")
                .set("Authorization", `Bearer ${token}`)
                .send(flight);

            expect(res.statusCode).toBe(201);
        }

        const query = {
            time: "2025-05-13T12:00:00Z",
            interval: 2,
        };

        const res = await request(app)
            .get(`/flights/queryTime?time=${query.time}&interval=${query.interval}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3);
        expect(res.body.map(f => f.name)).toEqual(
            expect.arrayContaining(["Flight 1", "Flight 2", "Flight 3"])
        );
        const flightNames = ["Flight 1", "Flight 2", "Flight 3"];
        try {
            const allFlights = await request(app)
                .get("/flights")
                .set("Authorization", `Bearer ${token}`);

            for (const flight of allFlights.body) {
                if (flightNames.includes(flight.name)) {
                    try {
                        await request(app)
                            .delete(`/flights/${flight.id}`)
                            .set("Authorization", `Bearer ${token}`);
                    } catch (error) {
                        console.error(`Failed to delete flight ${flight.id}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
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
        const flights = [
            { name: "Global Flight 1", time: "2025-06-01T10:00:00Z", userId: "userA" },
            { name: "Global Flight 2", time: "2025-06-01T12:00:00Z", userId: "userB" },
            { name: "Global Flight 3", time: "2025-06-01T14:00:00Z", userId: "userC" },
            { name: "Global Flight 4", time: "2025-06-02T10:00:00Z", userId: "userA" },
        ];

        for (const flight of flights) {
            await request(app)
                .post("/flights")
                .set("Authorization", `Bearer ${token}`)
                .send(flight);
        }

        const query = {
            time: "2025-06-01T12:00:00Z",
            interval: 3,
        };

        const res = await request(app)
            .get(`/flights/allFlights?time=${query.time}&interval=${query.interval}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.map(f => f.name)).toEqual(
            expect.arrayContaining(["Global Flight 1", "Global Flight 2", "Global Flight 3"])
        );
        expect(res.body.map(f => f.name)).not.toContain("Global Flight 4");

        const allFlights = await request(app)
            .get("/flights")
            .set("Authorization", `Bearer ${token}`);
        for (const flight of allFlights.body) {
            if (flight.name.startsWith("Global Flight")) {
                await request(app)
                    .delete(`/flights/${flight.id}`)
                    .set("Authorization", `Bearer ${token}`);
            }
        }
    });
});