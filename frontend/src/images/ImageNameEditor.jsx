// frontend/src/images/ImageNameEditor.jsx
import { useState } from "react";

export function ImageNameEditor({ imageId, initialValue, currentImage, onImageUpdated }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
        setError(""); // Clear any previous errors
    }

    async function handleSubmitPressed() {
        // Clear previous error
        setError("");
        
        // Don't submit if name is empty
        if (nameInput.length === 0) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nameInput })
            });
            
            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Bad request: Invalid data format');
                } else if (response.status === 404) {
                    throw new Error('Image not found');
                } else if (response.status === 413) {
                    throw new Error('Image name is too long (max 100 characters)');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            // Success - status 204 No Content
            // Update the parent component with the updated image
            // Create a new image object with the updated name
            const updatedImage = {
                ...currentImage,  // Spread all existing properties
                name: nameInput   // Override the name with the new value
            };
            
            // Pass the complete updated image back to the parent
            onImageUpdated(updatedImage);
            
            // Exit edit mode
            setIsEditingName(false);
            
        } catch (err) {
            setError(err.message);
            console.error("Failed to rename image:", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div style={{ margin: "1em 0" }}>
            {/* Accessible live region for screen readers */}
            <div aria-live="polite" className="sr-only">
                {isSubmitting && "Renaming image in progress..."}
                {error && `Error: ${error}`}
            </div>
            
            {error && (
                <div className="error-message" style={{ color: "#d32f2f", marginBottom: "0.5em" }}>
                    Error: {error}
                </div>
            )}
            
            {isSubmitting && (
                <div className="loading-message" style={{ color: "#666", marginBottom: "0.5em" }}>
                    Renaming image...
                </div>
            )}
            
            {isEditingName ? (
                <div>
                    <label>
                        New Name
                        <input
                            required
                            style={{ marginLeft: "0.5em", marginRight: "0.5em" }}
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </label>
                    <button 
                        disabled={nameInput.length === 0 || isSubmitting} 
                        onClick={handleSubmitPressed}
                    >
                        Submit
                    </button>
                    <button 
                        onClick={() => setIsEditingName(false)}
                        disabled={isSubmitting}
                        style={{ marginLeft: "0.5em" }}
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div>
                    <button onClick={handleEditPressed}>Edit name</button>
                </div>
            )}
        </div>
    );
}