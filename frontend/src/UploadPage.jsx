// frontend/src/UploadPage.jsx
import { useState, useActionState } from "react";
import { useNavigate } from "react-router";

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });
}

export function UploadPage({ authToken }) {
    const navigate = useNavigate();
    const [previewSrc, setPreviewSrc] = useState(null);

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const dataUrl = await readAsDataURL(file);
            setPreviewSrc(dataUrl);
        } else {
            setPreviewSrc(null);
        }
    }

    async function handleSubmit(prevState, formData) {
        const res = await fetch("/api/images", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
                // Do NOT set Content-Type — browser sets it automatically for FormData
            },
            body: formData,
        });

        if (res.status === 201) {
            const data = await res.json();
            navigate(`/images/${data._id}`);
            return null;
        } else {
            setPreviewSrc(null);
            return "Upload failed. Please try again.";
        }
    }

    const [errorMessage, submitAction, isPending] = useActionState(handleSubmit, null);

    return (
        <>
            <h2>Upload an Image</h2>

            {errorMessage && (
                <p className="LoginPage-error" aria-live="polite">
                    {errorMessage}
                </p>
            )}

            <form action={submitAction}>
                <div>
                    <label htmlFor="upload-file">Choose image to upload: </label>
                    <input
                        id="upload-file"
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        disabled={isPending}
                        onChange={handleFileChange}
                    />
                </div>

                <div style={{ marginTop: "1em" }}>
                    <label htmlFor="upload-name">
                        Image title:{" "}
                        <input
                            id="upload-name"
                            name="name"
                            required
                            disabled={isPending}
                        />
                    </label>
                </div>

                {previewSrc && (
                    <div style={{ marginTop: "1em" }}>
                        <img
                            style={{ width: "20em", maxWidth: "100%" }}
                            src={previewSrc}
                            alt="Preview of selected image"
                        />
                    </div>
                )}

                <div style={{ marginTop: "1em" }}>
                    <input
                        type="submit"
                        value={isPending ? "Uploading..." : "Confirm upload"}
                        disabled={isPending}
                    />
                </div>
            </form>
        </>
    );
}
