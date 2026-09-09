const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

// ======================================================
// Configuration
// ======================================================

const PORT = process.env.PORT || 4000;

// IMPORTANT:
// This secret MUST be exactly the same as the JWT secret
// configured in your Spring Boot services.
const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";


// ======================================================
// Middleware
// ======================================================

app.use(express.json());


// ======================================================
// Demo Users
// ======================================================

const users = [
    {
        id: 1,
        username: "alice1",
        password: "mission123",
        roles: ["MISSION_ADMIN"]
    },
    {
        id: 2,
        username: "alice2",
        password: "mission123",
        roles: ["MISSION_OPERATOR"]
    },
    {
        id: 3,
        username: "alice3",
        password: "mission123",
        roles: ["MISSION_VIEW"]
    },
    {
        id: 4,
        username: "alice4",
        password: "mission123",
        roles: ["MISSION_OPERATOR", "MISSION_VIEW"]
    }
];


// ======================================================
// Health Check
// ======================================================

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "up",
        service: "node-auth"
    });
});


// ======================================================
// Login
// ======================================================

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    // Validate request
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Find user
    const user = users.find(
        u => u.username === username && u.password === password
    );

    // Invalid credentials
    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    // ==================================================
    // Create JWT
    // ==================================================

    const token = jwt.sign(
        {
            sub: String(user.id),
            username: user.username,

            // IMPORTANT:
            // Spring Security is configured to read this
            // "roles" claim.
            roles: user.roles
        },
        JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "1h"
        }
    );

    // ==================================================
    // Response
    // ==================================================

    res.status(200).json({
        message: "Login successful",
        token: token,
        username: user.username,
        roles: user.roles
    });
});


// ======================================================
// Root Endpoint
// ======================================================

app.get("/", (req, res) => {
    res.json({
        service: "node-auth",
        status: "running",
        endpoints: {
            health: "GET /health",
            login: "POST /login"
        }
    });
});


// ======================================================
// Start Server
// ======================================================

// IMPORTANT:
// 0.0.0.0 allows access from:
// - localhost
// - LAN machines
// - Docker containers
// - other machines using 10.8.78.152
app.listen(PORT, "0.0.0.0", () => {
    console.log("========================================");
    console.log("Node Auth Service Started");
    console.log(`Port     : ${PORT}`);
    console.log(`Local    : http://localhost:${PORT}`);
    console.log(`Network  : http://10.8.78.152:${PORT}`);
    console.log(`Health   : http://10.8.78.152:${PORT}/health`);
    console.log("========================================");
});
