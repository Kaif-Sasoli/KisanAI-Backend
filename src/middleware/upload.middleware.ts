import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // 1 MB
    },
    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
            "application/octet-stream"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only image files are allowed"));
        }

        cb(null, true);
    },
});

export default upload;