import express from "express";
import { VALID_CONCRETE_PATHS } from "../../shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";
import { getEnvVar } from "./getEnvVar.js";
import { registerImageRoutes } from "./routes/imageRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { verifyAuthToken } from "./routes/authMiddleware.js";
import { imageMiddlewareFactory, handleImageFileErrors } from "./routes/imageUploadMiddleware.js";

console.log("=== DEBUG: Environment Variables ===");
console.log("MONGO_USER:", getEnvVar("MONGO_USER", false));
console.log("MONGO_CLUSTER:", getEnvVar("MONGO_CLUSTER", false));
console.log("DB_NAME:", getEnvVar("DB_NAME", false));
console.log("IMAGES_COLLECTION_NAME:", getEnvVar("IMAGES_COLLECTION_NAME", false));
console.log("CREDS_COLLECTION_NAME:", getEnvVar("CREDS_COLLECTION_NAME", false));
console.log("===================================");

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const IMAGE_UPLOAD_DIR = getEnvVar("IMAGE_UPLOAD_DIR") || "uploads";

const app = express();

app.use(express.json());
app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR));


app.get("/api/hello", (req, res) => {
    res.send("Hello, World");
});

let mongoClient;
let db;
let imageProvider;

async function initializeDatabase() {
    try {
        mongoClient = connectMongo();
        await mongoClient.connect();
        console.log("Connected to MongoDB successfully");

        db = mongoClient.db();
        imageProvider = new ImageProvider(mongoClient);

        registerAuthRoutes(app, db);
        console.log("Auth routes registered successfully");

        app.use("/api/images", verifyAuthToken);
        console.log("Auth middleware applied to /api/images routes");

        registerImageRoutes(app, imageProvider);
        console.log("Image routes registered successfully");

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

app.get(VALID_CONCRETE_PATHS, (req, res) => {
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.get("/images/:imageId", (req, res) => {
    console.log(`Serving index.html for image: ${req.params.imageId}`);
    res.sendFile("index.html", { root: STATIC_DIR });
});

process.on('SIGINT', async () => {
    if (mongoClient) {
        await mongoClient.close();
        console.log("MongoDB connection closed");
    }
    process.exit(0);
});

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`\nServer running at http://localhost:${PORT}`);
        console.log(`Serving static files from: ${STATIC_DIR}`);
        console.log(`Serving uploads from: ${IMAGE_UPLOAD_DIR}`);
        console.log(`Valid routes: ${VALID_CONCRETE_PATHS.join(', ')}`);
        console.log(`API endpoints:`);
        console.log(`  POST /api/users         - Register new user`);
        console.log(`  POST /api/auth/tokens   - Login (get JWT token)`);
        console.log(`  GET  /api/images        - Get all images (requires auth)`);
        console.log(`  GET  /api/images/:id    - Get one image by ID (requires auth)`);
        console.log(`  PATCH /api/images/:id   - Update image name (requires auth + ownership)`);
        console.log(`  POST /api/images        - Upload new image (requires auth)\n`);
    });
});
