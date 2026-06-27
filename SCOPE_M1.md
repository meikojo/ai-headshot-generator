# Scope: M1 (HF API Test)

## Architecture
- Node.js script using `fetch` or `node-fetch`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Script | `scripts/test_hf_api.js` | none | DONE |

## Interface Contracts
- Must connect to Hugging Face Free Inference API using `HUGGINGFACE_API_KEY` from `.env.local`.
- Must request an image from a model like `stabilityai/stable-diffusion-xl-base-1.0` or `black-forest-labs/FLUX.1-schnell`.
- Must return 200 OK and save/log the result.
