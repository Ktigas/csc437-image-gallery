import express from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider.js";

const MAX_NAME_LENGTH = 100;

export function registerImageRoutes(app, imageProvider) {
    // Get all images
    app.get("/api/images", async (req, res) => {
        try {
            const images = await imageProvider.getAllImagesDenormalized();
            res.json(images);
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    });

    // Get one image by ID
    app.get("/api/images/:id", async (req, res) => {
        try {
            const { id } = req.params;
            
            // Check if ID is a valid ObjectId
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

    // Rename image
    app.patch("/api/images/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            // Check if ID is a valid ObjectId
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            // Check if name is provided and is a string
            if (name === undefined || name === null) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Request body must include a 'name' field"
                });
            }

            if (typeof name !== 'string') {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "The 'name' field must be a string"
                });
            }

            // Check if name is empty or only whitespace
            if (name.trim().length === 0) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Image name cannot be empty"
                });
            }

            // Check if name is too long
            if (name.length > MAX_NAME_LENGTH) {
                return res.status(413).json({
                    error: "Content Too Large",
                    message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
                });
            }

            // Attempt to update the image
            const matchedCount = await imageProvider.updateImageName(id, name);

            if (matchedCount === 0) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            // Success - no content to return
            res.status(204).send();
        } catch (error) {
            console.error("Error updating image:", error);
            res.status(500).json({ error: "Failed to update image" });
        }
    });
}