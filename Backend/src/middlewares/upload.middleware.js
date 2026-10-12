import multer from "multer";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Profile image must be a JPG, PNG, or WebP");
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  },
}).single("profileImage");
