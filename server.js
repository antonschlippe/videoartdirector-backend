import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import generateVideo from "./runway/generateVideo.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// your app.post(...) logic below

app.post("/api/generate", upload.single("image"), async (req, res) => {
  const promptText = req.body.promptText;
  const imageBuffer = req.file?.buffer;

  if (!imageBuffer || !promptText) {
    return res.status(400).json({ error: "Image and promptText are required" });
  }

  try {
    // Convert buffer to base64 (Runway supports base64 images)
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString("base64")}`;
    const result = await generateVideo(base64Image, promptText);
    res.json(result);
  } catch (err) {
    console.error("Runway error:", err);
    res.status(500).json({ error: "Video generation failed" });
  }
});