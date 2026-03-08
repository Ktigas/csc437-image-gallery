// frontend/src/images/ImageDetails.jsx
import { useState, useEffect } from "react";
import { useParams } from 'react-router';
import { ImageNameEditor } from "./ImageNameEditor.jsx";

export function ImageDetails() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchImage = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/images/${imageId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Image with ID ${imageId} not found`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setImage(data);
            setError("");
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch image:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImage();
    }, [imageId]);

    const handleImageUpdated = (updatedImage) => {
        setImage(updatedImage);
    };

    if (loading) {
        return (
            <div className="image-details-container">
                <h2>Image Details</h2>
                <div className="loading">Loading image...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="image-details-container">
                <h2>Image Details</h2>
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    if (!image) {
        return (
            <div className="image-details-container">
                <h2>Image Details</h2>
                <div className="error">Image not found</div>
            </div>
        );
    }

    return (
        <div className="image-details-container">
            <h2>{image.name}</h2>
            <p className="author">By {image.author?.username || 'Unknown'}</p>
            <ImageNameEditor 
                imageId={image._id}
                initialValue={image.name}
                currentImage={image}  // Pass the current image object
                onImageUpdated={handleImageUpdated}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
            {image.author?.email && (
                <p className="author-email">Email: {image.author.email}</p>
            )}
        </div>
    );
}