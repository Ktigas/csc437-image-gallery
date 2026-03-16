import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";
import { CredentialsProvider } from "../CredentialsProvider.js";

function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = { username };
        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token);
            }
        );
    });
}

export function registerAuthRoutes(app, db) {
    // POST /api/users — Register a new account
    app.post("/api/users", async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).send({
                    error: "Bad request",
                    message: "Missing username, email, or password"
                });
            }

            const success = await CredentialsProvider.registerUser(db, username, email, password);

            if (success) {
                // Automatically log the user in by returning a token (Lab 23b requirement)
                const token = await generateAuthToken(username);
                res.status(201).send({ token });
            } else {
                res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken"
                });
            }
        } catch (error) {
            console.error("Error in user registration:", error);
            res.status(500).send({
                error: "Internal Server Error",
                message: "An error occurred during registration"
            });
        }
    });

    // POST /api/auth/tokens — Login
    app.post("/api/auth/tokens", async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).send({
                    error: "Bad request",
                    message: "Missing username or password"
                });
            }

            const isValid = await CredentialsProvider.verifyPassword(db, username, password);

            if (isValid) {
                const token = await generateAuthToken(username);
                res.status(200).send({ token });
            } else {
                res.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid username or password"
                });
            }
        } catch (error) {
            console.error("Error in login:", error);
            res.status(500).send({
                error: "Internal Server Error",
                message: "An error occurred during login"
            });
        }
    });
}