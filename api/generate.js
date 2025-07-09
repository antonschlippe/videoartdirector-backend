const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const generateVideo = require('../runway/generateVideo.js');

export const config = {
  api: {
    bodyParser: false,
  },
};

const __dirname = __dirname;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.videoartdirector.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Handle preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm({ multiples: false });
  form.uploadDir = path.join(__dirname, 'uploads');
  form.keepExtensions = true;

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir);
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const imagePath = files.image[0].filepath;
    const promptText = fields.promptText[0];

    try {
      const video = await generateVideo(imagePath, promptText);
      res.status(200).json({ output: [video.output.url] });
    } catch (error) {
      console.error('Error generating video:', error);
      res.status(500).json({ error: 'Video generation failed' });
    }
  });
};