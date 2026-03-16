import multer from "multer";
import { getEnvVar } from "../getEnvVar.js";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = getEnvVar("IMAGE_UPLOAD_DIR") || "uploads";
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        let fileExtension;

        if (file.mimetype === "image/png") {
            fileExtension = "png";
        } else if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            fileExtension = "jpg";
        } else {
            cb(new ImageFormatError("Unsupported image type"), "");
            return;
        }

        const fileName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + fileExtension;
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

export function handleImageFileErrors(err, req, res, next) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err);
}