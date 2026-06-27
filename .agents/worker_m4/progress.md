# Progress - Milestone 4

Last visited: 2026-06-26T16:39:00+03:00

## Tasks
- [ ] Create/Update `src/app/api/text-to-image/route.ts`
- [ ] Create/Update `src/app/api/cleanup/route.ts`
- [ ] Create/Update `src/app/api/upscale/route.ts`
- [ ] Create/Update `src/app/api/reimagine/route.ts`
- [ ] Create/Update `src/app/api/uncrop/route.ts`
- [ ] Remove or redirect/deprecate old routes in `src/app/api/tools/*` to avoid duplicate routes
- [ ] Add rate limiting checking (`checkRateLimit`) and DB configuration lookup (`getAppSettings`) in all 5 routes
- [ ] Implement Offline try-catch Fallbacks returning placeholders/original images
- [ ] Verify build compiles successfully (`npm run build` or `npx tsc --noEmit`)
