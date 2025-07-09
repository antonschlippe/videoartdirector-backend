// runway/generateVideo.js

const RunwayML = require('@runwayml/sdk');
const { TaskFailedError } = require('@runwayml/sdk');

/**
 * Generates a video using Runway's image-to-video Gen-4 Turbo model.
 * @param {string} imageInput - A URL pointing to your image.
 * @param {string} promptText - Text prompt for the video generation.
 * @returns {object} The completed task result from Runway.
 */
async function generateVideo(imageUrl, promptText) {
  const client = new RunwayML({
    apiKey: process.env.RUNWAY_API_KEY
  });
  

  try {
    const task = await client.imageToVideo
      .create({
        model: 'gen4_turbo',
        promptImage: imageInput,
        promptText: promptText,
        ratio: '1280:720',
        duration: 1
      })
      .waitForTaskOutput();

    return task;
  } catch (error) {
    if (error instanceof TaskFailedError) {
      console.error('The video failed to generate.');
      console.error(error.taskDetails);
      throw new Error('Video generation failed');
    } else {
      console.error(error);
      throw error;
    }
  }
}

module.exports = { generateVideo };