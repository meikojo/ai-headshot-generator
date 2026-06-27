const fs = require('fs');
const path = require('path');
const { loadEnvConfig } = require('@next/env');

// Load environment variables from .env.local (and other .env files)
loadEnvConfig(process.cwd());

async function testHuggingFaceAPI() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    console.error("❌ ERROR: HUGGINGFACE_API_KEY is not defined in .env.local");
    process.exit(1);
  }

  // We can use FLUX.1-schnell or stable-diffusion-xl-base-1.0
  const modelUrl = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';
  
  const prompt = "A professional cinematic headshot of a business executive, ultra realistic, 8k";

  console.log(`Sending request to ${modelUrl}...`);
  
  try {
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (response.ok) {
      console.log("✅ 200 OK: Request successful.");
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Save the result to the scripts directory
      const outputPath = path.join(__dirname, 'output.png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ Image successfully saved to ${outputPath}`);
    } else {
      const errorText = await response.text();
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorText}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Network or Execution Error:", error);
    process.exit(1);
  }
}

testHuggingFaceAPI();
