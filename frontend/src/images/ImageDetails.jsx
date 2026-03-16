// frontend/src/images/ImageDetails.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor.jsx";

export function ImageDetails({ authToken }) {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchImage() {
            try {
                setLoading(true);
                const response = await fetch(`/api/images/${imageId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

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
        }

        fetchImage();
    }, [imageId, authToken]);

    if (loading) {
        return (
            <div>
                <h2>Image Details</h2>
                <div>Loading image...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Image Details</h2>
                <div>Error: {error}</div>
            </div>
        );
    }

    if (!image) {
        return (
            <div>
                <h2>Image Details</h2>
                <div>Image not found</div>
            </div>
        );
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <p>By {image.author?.username || "Unknown"}</p>
            <ImageNameEditor
                imageId={image._id}
                initialValue={image.name}
                currentImage={image}
                authToken={authToken}
                onImageUpdated={setImage}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </div>
    );
}
