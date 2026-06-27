# Scope: M3 (HF API Tools)

## Architecture
- Refactor the 5 tools: Text-to-Image, Reimagine, Cleanup, Upscale, Uncrop.
- Route requests through Hugging Face Free Inference API using `HUGGINGFACE_API_KEY` (use standard Fetch as implemented in M1).
- Avoid `CLIPDROP_API_KEY` entirely.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | HF API Refactor | `src/app/api/tools/*` endpoints and corresponding frontend pages | none | DONE |

## Interface Contracts
- Endpoints must receive request from frontend, hit HF API, return `resultUrl` or base64.
- Must still track usage and enforce paywall.
