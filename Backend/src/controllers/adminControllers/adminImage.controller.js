import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { upload } from "./multerConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(
  __dirname,
  "../Frontend/src/assets/adminImages/settings"
);

export const uploadAdminImages = async (req, res) => {
  console.log("Entering uploadAdminImages:", req.method); // Debug
  try {
    if (req.method === "POST") {
      return upload.single("image")(req, res, (err) => {
        console.log("POST handler started"); // Debug
        console.log("POST req.body:", req.body); // Debug
        console.log("POST req.file:", req.file); // Debug
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
          console.error("No file uploaded");
          return res.status(400).json({ error: "No image file provided" });
        }
        const type = req.body.type;
        console.log("POST type:", type); // Debug
        if (type !== "logo" && type !== "favicon") {
          console.log("Deleting invalid file:", req.file.path); // Debug
          fs.unlinkSync(req.file.path);
          return res
            .status(400)
            .json({ error: "Invalid type; must be 'logo' or 'favicon'" });
        }
        // Rename file from temp to type.<ext>
        const ext = path.extname(req.file.filename);
        const newFilename = `${type}${ext}`;
        const newPath = path.join(uploadDir, newFilename);
        console.log("Renaming file:", req.file.path, "to", newPath); // Debug
        fs.renameSync(req.file.path, newPath);
        const imageUrl = `/assets/adminImages/settings/${newFilename}`;
        console.log("POST imageUrl:", imageUrl); // Debug
        return res.json({ imageUrl });
      });
    } else if (req.method === "DELETE") {
      console.log("DELETE req.body:", req.body); // Debug
      const { type } = req.body;
      if (!type || !["logo", "favicon"].includes(type)) {
        return res.status(400).json({ error: "Invalid or missing type" });
      }

      const files = fs.readdirSync(uploadDir);
      const targetFile = files.find((file) => file.startsWith(type));
      if (targetFile) {
        console.log("Deleting file:", targetFile); // Debug
        fs.unlinkSync(path.join(uploadDir, targetFile));
        return res.json({ message: "File deleted successfully" });
      }
      return res.status(404).json({ error: "File not found" });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in uploadAdminImages:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
