import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { VALID_CONCRETE_PATHS } from "../../shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";
import { registerImageRoutes } from "./routes/imageRoutes.js";

console.log("=== DEBUG: Environment Variables ===");
console.log("MONGO_USER:", getEnvVar("MONGO_USER", false));
console.log("MONGO_CLUSTER:", getEnvVar("MONGO_CLUSTER", false));
console.log("DB_NAME:", getEnvVar("DB_NAME", false));
console.log("IMAGES_COLLECTION_NAME:", getEnvVar("IMAGES_COLLECTION_NAME", false));
console.log("===================================");

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the React build
app.use(express.static(STATIC_DIR));

// Simple test endpoint
app.get("/api/hello", (req, res) => {
    res.send("Hello, World");
});

// Create a single MongoDB connection for all routes
let mongoClient;
let imageProvider;

async function initializeDatabase() {
    try {
        mongoClient = connectMongo();
        await mongoClient.connect();
        console.log("Connected to MongoDB successfully");
        
        imageProvider = new ImageProvider(mongoClient);
        
        // Register all image routes
        registerImageRoutes(app, imageProvider);
        
        console.log("Image routes registered successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

// Handle ALL valid frontend routes - serve index.html
app.get(VALID_CONCRETE_PATHS, (req, res) => {
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile("index.html", { root: STATIC_DIR });
});

// Handle image detail routes (for SPA)
app.get("/images/:imageId", (req, res) => {
    console.log(`Serving index.html for image: ${req.params.imageId}`);
    res.sendFile("index.html", { root: STATIC_DIR });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    if (mongoClient) {
        await mongoClient.close();
        console.log("MongoDB connection closed");
    }
    process.exit(0);
});

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`\nServer running at http://localhost:${PORT}`);
        console.log(`Serving static files from: ${STATIC_DIR}`);
        console.log(`Valid routes: ${VALID_CONCRETE_PATHS.join(', ')}`);
        console.log(`API endpoints:`);
        console.log(`  GET /api/images - Get all images`);
        console.log(`  GET /api/images/:id - Get one image by ID`);
        console.log(`  PATCH /api/images/:id - Update image name\n`);
    });
});