const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { ApiError } = require("../utils/api-error");

const router = express.Router();

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/ogg"
]);
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// Store uploads in /uploads relative to project root
const UPLOAD_DIR = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
    }
  }
});

router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.array("files", 20),
  asyncHandler(async (req, res) => {
    const files = req.files;
    if (!files || !files.length) {
      throw new ApiError(400, "No files uploaded.");
    }

    const items = files.map((f) => ({
      mediaUrl: `/uploads/${f.filename}`,
      mediaType: f.mimetype.startsWith("video") ? "video" : "image"
    }));

    res.status(201).json({ items });
  })
);

module.exports = router;
