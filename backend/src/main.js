import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { VALID_CONCRETE_PATHS } from "../../shared/ValidRoutes.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();

// Serve static files from the React build
app.use(express.static(STATIC_DIR));

// Hello world route (keep for testing)
app.get("/hello", (req, res) => {
    res.send("Hello, World");
});

// Handle ALL valid frontend routes - serve index.html
app.get(VALID_CONCRETE_PATHS, (req, res) => {
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}. CTRL+C to stop.`);
    console.log(`Serving static files from: ${STATIC_DIR}`);
    console.log(`Valid routes: ${VALID_CONCRETE_PATHS.join(', ')}`);
});