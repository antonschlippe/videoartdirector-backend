import multer from "multer";
import generateVideo from "../runway/generateVideo.js";

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Required for multer to work with Vercel
  },
};

// Helper to run middleware in Vercel's handler format
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await runMiddleware(req, res, upload.single("image"));

  const promptText = req.body.promptText;
  const imageBuffer = req.file?.buffer;

  if (!imageBuffer || !promptText) {
    return res.status(400).json({ error: "Image and promptText are required" });
  }

  try {
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString("base64")}`;
    const result = await generateVideo(base64Image, promptText);
    res.status(200).json(result);
  } catch (err) {
    console.error("Runway error:", err);
    res.status(500).json({ error: "Video generation failed" });
  }
}