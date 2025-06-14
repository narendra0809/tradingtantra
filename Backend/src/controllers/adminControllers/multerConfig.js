import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(
  __dirname,
  "../Frontend/src/assets/adminImages/settings"
);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log("Multer filename req.body:", req.body); // Debug
    const ext = path.extname(file.originalname);
    const tempName = `temp-${Date.now()}${ext}`; // Temporary filename
    cb(null, tempName);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Multer fileFilter:", file.mimetype); // Debug
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({ storage, fileFilter });
