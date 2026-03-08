// frontend/src/images/ImageDetails.jsx
import { useState, useEffect } from "react";
import { useParams } from 'react-router';

export function ImageDetails() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchImage() {
            try {
                // Fetch all images from the backend
                const response = await fetch("/api/images");
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const images = await response.json();
                const foundImage = images.find(img => img.id === imageId);
                
                if (!foundImage) {
                    throw new Error(`Image with ID ${imageId} not found`);
                }
                
                setImage(foundImage);
                setError("");
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch image:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchImage();
    }, [imageId]);

    if (loading) {
        return (
            <>
                <h2>Image Details</h2>
                <div className="loading">Loading image...</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <h2>Image Details</h2>
                <div className="error">Error: {error}</div>
            </>
        );
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    );
}