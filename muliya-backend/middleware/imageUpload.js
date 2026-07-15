import multer from "multer";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        "Unsupported image format. Upload JPEG, PNG, or WebP."
      ),
      false
    );
  }

  callback(null, true);
};

const uploadJewelleryImage = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter,
});

const handleImageUpload = (req, res, next) => {
  uploadJewelleryImage.single("image")(
    req,
    res,
    (error) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message:
              "The image is too large. Maximum file size is 10 MB.",
          });
        }

        return res.status(400).json({
          success: false,
          message:
            error.message || "Unable to upload the image.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message || "Invalid image upload.",
      });
    }
  );
};

export { handleImageUpload };