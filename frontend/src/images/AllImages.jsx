// frontend/src/images/AllImages.jsx
import { useState, useEffect } from "react";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages({ authToken }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchImages() {
            try {
                const response = await fetch("/api/images", {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setImages(data);
                setError("");
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch images:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchImages();
    }, [authToken]);

    if (loading) {
        return (
            <>
                <h2>All Images</h2>
                <div>Loading images...</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <h2>All Images</h2>
                <div>Error loading images: {error}</div>
            </>
        );
    }

    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={images} />
        </>
    );
}
