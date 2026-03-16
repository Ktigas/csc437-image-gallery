// frontend/src/images/ImageNameEditor.jsx
import { useState } from "react";

export function ImageNameEditor({ imageId, initialValue, currentImage, authToken, onImageUpdated }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
        setError("");
    }

    async function handleSubmitPressed() {
        setError("");
        if (nameInput.length === 0) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ name: nameInput }),
            });

            if (response.status === 403) {
                throw new Error("You do not own this image.");
            } else if (response.status === 401) {
                throw new Error("You must be logged in to rename images.");
            } else if (!response.ok) {
                throw new Error(`Failed to rename image (status ${response.status})`);
            }

            onImageUpdated({ ...currentImage, name: nameInput });
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
            {error && (
                <p style={{ color: "#d32f2f" }} aria-live="polite">
                    {error}
                </p>
            )}

            {isEditingName ? (
                <div>
                    <label>
                        New name{" "}
                        <input
                            required
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </label>
                    <button
                        onClick={handleSubmitPressed}
                        disabled={nameInput.length === 0 || isSubmitting}
                        style={{ marginLeft: "0.5em" }}
                    >
                        {isSubmitting ? "Saving..." : "Submit"}
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
                <button onClick={handleEditPressed}>Edit name</button>
            )}
        </div>
    );
}
