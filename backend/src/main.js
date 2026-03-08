import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { VALID_CONCRETE_PATHS } from "../../shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";


// Add this right after your imports, before const PORT...
console.log("=== DEBUG: Environment Variables ===");
console.log("MONGO_USER:", getEnvVar("MONGO_USER", false));
console.log("MONGO_CLUSTER:", getEnvVar("MONGO_CLUSTER", false));
console.log("DB_NAME:", getEnvVar("DB_NAME", false));
console.log("IMAGES_COLLECTION_NAME:", getEnvVar("IMAGES_COLLECTION_NAME", false));
console.log("===================================");

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req, res) => {
    res.send("Hello, World");
});

app.get("/api/images", async (req, res) => {
    console.log("\n=== API: Fetching all images from MongoDB ===");
    console.log("1. Request received at:", new Date().toISOString());
    
    let client;
    try {
        // Connect to MongoDB
        console.log("2. Connecting to MongoDB...");
        client = connectMongo();
        await client.connect();
        console.log("3. Connected to MongoDB successfully");
        
        // Create ImageProvider and fetch images
        console.log("4. Creating ImageProvider...");
        const imageProvider = new ImageProvider(client);
        
        console.log("5. Fetching images from database...");
        const images = await imageProvider.getAllImages();
        
        console.log(`6. Raw images from provider:`, JSON.stringify(images, null, 2));
        
        // Add 1-second delay
        console.log("7. Waiting 1 second delay...");
        await waitDuration(1000);
        
        console.log(`8. API: Found ${images.length} images in database`);
        
        // Send the response
        console.log("9. Sending response...");
        res.json(images);
        console.log("10. Response sent successfully");
        
    } catch (error) {
        console.error("❌ ERROR in API route:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        res.status(500).json({ 
            error: "Failed to fetch images from database",
            message: error.message
        });
    } finally {
        if (client) {
            await client.close();
            console.log("11. MongoDB connection closed");
        }
    }
});

app.get(VALID_CONCRETE_PATHS, (req, res) => {
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log(`Serving static files from: ${STATIC_DIR}`);
    console.log(`Valid routes: ${VALID_CONCRETE_PATHS.join(', ')}`);
    console.log(`API endpoint: /api/images with 1s delay (using MongoDB)\n`);
});