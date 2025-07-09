const generateVideoModule = require('../runway/generateVideo.js');
const generateVideo = generateVideoModule.generateVideo;
console.log('generateVideo type:', typeof generateVideo);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.videoartdirector.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight request
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ensure body is parsed as JSON
    let body = req.body;
    if (!body || typeof body !== 'object') {
      // Try to parse if not already parsed
      body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
          data += chunk;
        });
        req.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    const { imageBase64, promptText } = body;

    if (!imageBase64 || !promptText) {
      return res.status(400).json({ error: 'Missing image or prompt' });
    }

    const video = await generateVideo(imageBase64, promptText);
    res.status(200).json({ output: [video.output.url] });

  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
};