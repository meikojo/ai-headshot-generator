const { loadEnvConfig } = require('@next/env');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HF_API_KEY) {
  console.error("Error: HUGGINGFACE_API_KEY is not set in .env.local");
  process.exit(1);
}

const MODEL = 'black-forest-labs/FLUX.1-schnell';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

async function testHuggingFaceApi() {
  console.log(`Connecting to Hugging Face Free Inference API for model ${MODEL}...`);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "A beautiful professional headshot photograph",
      }),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('Success! Receiving image data...');
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const outputPath = path.join(__dirname, 'output.jpg');
      fs.writeFileSync(outputPath, buffer);
      console.log(`Image saved to ${outputPath}`);
    } else {
      const errorText = await response.text();
      console.error(`Request failed. Response: ${errorText}`);
    }
  } catch (error) {
    console.error('Error connecting to the API:', error.message);
  }
}

testHuggingFaceApi();
