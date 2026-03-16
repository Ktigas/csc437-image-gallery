import { ObjectId } from "mongodb";
import { imageMiddlewareFactory, handleImageFileErrors } from "./imageUploadMiddleware.js";

const MAX_NAME_LENGTH = 100;

export function registerImageRoutes(app, imageProvider) {
    // GET /api/images — Get all images (denormalized)
    app.get("/api/images", async (req, res) => {
        try {
            const images = await imageProvider.getAllImagesDenormalized();
            res.json(images);
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    });

    // GET /api/images/:id — Get one image by ID
    app.get("/api/images/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "No image with that ID"
                });
            }

            const image = await imageProvider.getImageById(id);

            if (!image) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "No image with that ID"
                });
            }

            res.json(image);
        } catch (error) {
            console.error("Error fetching image:", error);
            res.status(500).json({ error: "Failed to fetch image" });
        }
    });

    // PATCH /api/images/:id — Rename an image (owner only)
    app.patch("/api/images/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const username = req.userInfo?.username;

            if (!username) {
                return res.status(401).end();
            }

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            if (name === undefined || name === null) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Request body must include a 'name' field"
                });
            }

            if (typeof name !== "string") {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "The 'name' field must be a string"
                });
            }

            if (name.trim().length === 0) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Image name cannot be empty"
                });
            }

            if (name.length > MAX_NAME_LENGTH) {
                return res.status(413).json({
                    error: "Content Too Large",
                    message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
                });
            }

            const image = await imageProvider.getImageById(id);

            if (!image) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            // getImageById returns { author: { username } } — check nested field
            if (image.author?.username !== username) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: "This user does not own this image"
                });
            }

            const matchedCount = await imageProvider.updateImageName(id, name);

            if (matchedCount === 0) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            res.status(204).send();
        } catch (error) {
            console.error("Error updating image:", error);
            res.status(500).json({ error: "Failed to update image" });
        }
    });

    // POST /api/images — Upload a new image (Lab 24)
    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req, res) => {
            try {
                const username = req.userInfo?.username;

                if (!username) {
                    return res.status(401).end();
                }

                if (!req.file || !req.body.name) {
                    return res.status(400).json({
                        error: "Bad Request",
                        message: "Must provide an image file and a name"
                    });
                }

                const newId = await imageProvider.createImage({
                    src: `/uploads/${req.file.filename}`,
                    name: req.body.name,
                    authorId: username
                });

                res.status(201).json({ _id: newId });
            } catch (error) {
                console.error("Error uploading image:", error);
                res.status(500).json({ error: "Failed to upload image" });
            }
        }
    );
}