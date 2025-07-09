import formidable from "formidable";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import generateVideo from "../runway/generateVideo.js";

// Enable CORS
export const config = {
  api: {
    bodyParser: false,
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to handle CORS manually
function allowCors(handler) {
  return async (req, res) => {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    return await handler(req, res);
  };
}

const handler = async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: false });
  form.uploadDir = path.join(__dirname, "uploads");
  form.keepExtensions = true;

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir);
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Form parsing error" });
    }

    const imagePath = files.image[0].filepath;
    const promptText = fields.promptText[0];

    try {
      const video = await generateVideo(imagePath, promptText);
      res.status(200).json({ output: [video.output.url] });
    } catch (error) {
      console.error("Error generating video:", error);
      res.status(500).json({ error: "Video generation failed" });
    }
  });
};

export default allowCors(handler);