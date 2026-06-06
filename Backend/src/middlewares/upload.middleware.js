const fs = require("fs");
const path = require("path");
const multer = require("multer");

const productUploadsDir = path.join(process.cwd(), "uploads", "productos");

fs.mkdirSync(productUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  console.log("DESTINO:", productUploadsDir);
  cb(null, productUploadsDir);
 },
  filename: (req, file, cb) => {
  console.log("ARCHIVO RECIBIDO:", file.originalname);

  const ext = path.extname(file.originalname || "").toLowerCase() || ".png";

  const safeBase = path
    .basename(file.originalname || "imagen", ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 50);

  cb(null, `${Date.now()}-${safeBase}${ext}`);
},
  });

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten archivos de imagen."));
  }

  cb(null, true);
};

const productImageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
});

module.exports = {
  productImageUpload,
  productUploadsDir,
};
