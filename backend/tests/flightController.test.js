const request = require("supertest");
const app = require("../index"); // Import your Express app
const jwt = require("jsonwebtoken");

// Mock JWT token for a logged-in user
const userId = "1"; // Replace with a valid user ID from your database
const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Flight Controller Endpoints", () => {
    let server; // To store the server instance
    let flightId;

    // Start the server before running tests
    beforeAll((done) => {
        server = app.listen(4000, () => {
            done();
        });
    });

    // Close the server after all tests
    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    // Test: Get all flights
    it("should fetch all flights for the logged-in user", async () => {
        const res = await request(app)
            .get("/flights")
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // Test: Create a new flight
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
        flightId = res.body.id; // Save the flight ID for later tests
    });

    // Test: Get a single flight by ID
    it("should fetch a single flight by ID for the logged-in user", async () => {
        const res = await request(app)
            .get(`/flights/${flightId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id", flightId);
    });

    // Test: Update a flight
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

    // Test: Delete a flight
    it("should delete the flight for the logged-in user", async () => {
        const res = await request(app)
            .delete(`/flights/${flightId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });

    // Test: Ensure deleted flight cannot be fetched
    it("should return 404 for a deleted flight", async () => {
        const res = await request(app)
            .get(`/flights/${flightId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });

    // Test: Ensure unauthenticated users cannot modify the table
    it("should return 401 Unauthorized for unauthenticated users trying to modify the table", async () => {
        const flightData = {
            name: "Unauthorized Flight",
            time: "2025-05-12T10:00:00",
        };

        // Attempt to create a flight without an Authorization header
        const res = await request(app)
            .post("/flights")
            .send(flightData); // No Authorization header

        expect(res.statusCode).toBe(401); // Expect 401 Unauthorized
        expect(res.body).toEqual({}); // Expect an empty response body
    });
    // Test: Get flights within a specific time range
    it("should fetch flights within a specific time range for the logged-in user", async () => {
        // Create multiple flights
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

            expect(res.statusCode).toBe(201); // Ensure flights are created successfully
        }

        // Query flights within a 2-hour interval around "2025-05-13T12:00:00Z"
        const query = {
            time: "2025-05-13T12:00:00Z",
            interval: 2, // 2 hours before and after
        };

        const res = await request(app)
            .get(`/flights/queryTime?time=${query.time}&interval=${query.interval}`)
            .set("Authorization", `Bearer ${token}`);

        // console.log("Response body:", res.body); // Log the response body for debugging
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3); // All 3 flights should match the filter
        expect(res.body.map(f => f.name)).toEqual(
            expect.arrayContaining(["Flight 1", "Flight 2", "Flight 3"])
        );
        // Clean up: delete the created flights
        const flightNames = ["Flight 1", "Flight 2", "Flight 3"];
        try {
            // Get all flights first
            const allFlights = await request(app)
                .get("/flights")
                .set("Authorization", `Bearer ${token}`);

            // Delete each flight that matches our test flight names
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
});

