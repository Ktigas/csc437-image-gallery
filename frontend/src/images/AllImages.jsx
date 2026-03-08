// frontend/src/images/AllImages.jsx
import { useState, useEffect } from "react";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchImages() {
            try {
                // Fetch from the backend API (proxied through Vite)
                const response = await fetch("/api/images");
                
                // Check if the response is OK (status 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
                }
                
                // Parse the JSON response
                const data = await response.json();
                
                // Update state with the fetched images
                setImages(data);
                setError(""); // Clear any previous errors
            } catch (err) {
                // Handle any errors (network issues, JSON parsing errors, etc.)
                setError(err.message);
                console.error("Failed to fetch images:", err);
            } finally {
                // Whether success or error, loading is complete
                setLoading(false);
            }
        }

        fetchImages();
    }, []); // Empty dependency array means this runs once when component mounts

    // Show loading state
    if (loading) {
        return (
            <>
                <h2>All Images</h2>
                <div className="loading">Loading images...</div>
            </>
        );
    }

    // Show error state
    if (error) {
        return (
            <>
                <h2>All Images</h2>
                <div className="error">Error loading images: {error}</div>
            </>
        );
    }

    // Show the images (success state)
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={images} />
        </>
    );
}