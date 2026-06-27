# M1 (HF API Test) Investigation Handoff

## 1. Observation
- `d:/ai-headshot-generator/SCOPE_M1.md` defines Milestone 1 as building a Node.js script (`scripts/test_hf_api.js`) that uses `fetch` or `node-fetch`.
- The script must connect to the Hugging Face Free Inference API using `HUGGINGFACE_API_KEY` from `.env.local` and request an image from a model (e.g., `black-forest-labs/FLUX.1-schnell`), then return a 200 OK and save the result.
- `package.json` reveals the project uses Next.js 14, implying a Node.js runtime of at least v18.x, which has native `fetch` support. It does not include `dotenv`.
- The `scripts/` directory does not currently exist.
- `d:/ai-headshot-generator/.env.local` exists, but does not currently contain the `HUGGINGFACE_API_KEY` environment variable.

## 2. Logic Chain
- **File Structure**: Since `scripts/` does not exist, the implementer needs to create this directory and the `test_hf_api.js` script within it.
- **Environment Variables**: Because `dotenv` is not in `package.json`, the script should manually parse `.env.local` using `fs.readFileSync` and a simple regex, or instruct the user to run it with Node 20's `--env-file=.env.local` flag. Manual parsing is safer across Node versions. The implementer must also add `HUGGINGFACE_API_KEY` to `.env.local`.
- **API Request**: The script can use the native `fetch` API to send a `POST` request to `https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell`. The `Authorization` header must be set to `Bearer <HUGGINGFACE_API_KEY>`.
- **Handling Response**: Since the API returns an image, the response must be parsed as an `ArrayBuffer`, converted to a Node `Buffer`, and saved to the filesystem (e.g., `test_hf_output.jpg`) using `fs.writeFileSync`.

## 3. Caveats
- The Hugging Face Free Inference API sometimes returns a 503 error if the model is loading. The basic implementation might fail on the first run if the model is "cold." It may be beneficial to add a simple retry mechanism or log a specific message telling the user to "wait a moment and try again."
- A valid `HUGGINGFACE_API_KEY` must be added to `.env.local` before execution.

## 4. Conclusion
The implementation strategy is straightforward. The implementer should:
1. Create the `scripts` directory and `scripts/test_hf_api.js`.
2. Write a Node.js script that manually reads `.env.local` to extract `HUGGINGFACE_API_KEY`.
3. Use the native `fetch` API to POST to the chosen Hugging Face model URL.
4. Process the response using `await response.arrayBuffer()`, convert to a Buffer, and save it to the root directory as an image file.
5. Add a placeholder or real `HUGGINGFACE_API_KEY` to `.env.local`.

## 5. Verification Method
1. Ensure a valid `HUGGINGFACE_API_KEY` is present in `d:/ai-headshot-generator/.env.local`.
2. Run `node scripts/test_hf_api.js` in the terminal.
3. Verify the console logs a success message with a 200 OK status.
4. Inspect the root directory for the output image (e.g., `test_hf_output.jpg`) and verify it is a valid image file.
