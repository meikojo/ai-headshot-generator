const fs = require('fs');
const path = require('path');

// Next.js provides @next/env to load .env.local easily
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!API_KEY) {
  console.error("Error: HUGGINGFACE_API_KEY is not defined in the environment.");
  console.error("Please add it to your .env.local file.");
  process.exit(1);
}

const MODEL_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

async function testHFAPI() {
  console.log(`Connecting to Hugging Face Inference API...`);
  console.log(`Model: ${MODEL_URL}`);
  
  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "A cinematic headshot of a professional, dark navy theme, electric blue accents, highly detailed, photorealistic",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: Received status ${response.status} ${response.statusText}`);
      console.error("Details:", errorText);
      process.exit(1);
    }

    console.log(`Success: Received status 200 OK.`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save the result to the root directory
    const outputFileName = 'hf_test_output.jpg';
    const outputPath = path.join(process.cwd(), outputFileName);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Image successfully saved to ${outputPath}`);
  } catch (error) {
    console.error("Error during API request:", error.message);
    process.exit(1);
  }
}

testHFAPI();
