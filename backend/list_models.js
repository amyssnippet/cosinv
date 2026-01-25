/**
 * Script to list available Gemini models.
 */
// Commit on 2026-01-25

const https = require('https');

function parseModels(data) {
  try {
    const response = JSON.parse(data);
    return response.models.map(model => model.name);
  } catch (error) {
    console.error('Failed to parse models:', error);
    return [];
  }
}

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const models = parseModels(data);
        console.log('Available models:', models);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
