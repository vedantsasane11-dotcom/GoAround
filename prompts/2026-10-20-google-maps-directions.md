# GoAround: Google Maps Directions Feature

- **Date**: 2026-10-20
- **Feature / Task**: Get Directions button on each destination card in the trip result timeline
- **Status**: completed

---

## Original Prompt

> Let users get directions to a destination after they have generated a trip on GoAround's Plan Trip page.

### Implementation requirements

1. Inspect the existing code first, particularly `TripResultView.tsx`, destination types, `plannerEngine.ts`, and the current trip result layout.

2. Add a small **Get Directions ↗** action to each destination card in the generated trip timeline. Place it near the existing "Why we added this" action or another suitable location within the card.

3. Keep the existing design, layout, colors, destination cards, Replace button, trip generation, and responsive behavior unchanged except for this addition.

4. When clicked, open Google Maps directions in a new browser tab for that specific destination:
   `https://www.google.com/maps/dir/?api=1&destination=...`

5. Use the destination's actual latitude and longitude from the existing GeoJSON/Supabase data whenever valid coordinates are available. Otherwise, use its real address or destination name as a fallback. Encode URL parameters correctly.

6. Use a starting point only if the existing trip data contains a valid, meaningful origin. Otherwise, omit the origin so Google Maps can let users choose their starting point or current location.

7. Do not hardcode a destination, invent coordinates, or navigate to a placeholder location. Hide or disable the action gracefully when no usable destination information exists.

8. Do not add a Google Maps API key, paid API integration, new mapping dependency, or separate directions page. Use a standard Google Maps URL.

9. Follow existing project conventions and accessibility practices. Make the button work on desktop and mobile.

10. After implementation, run the available lint/type checks and production build.

11. Update the archived prompt with its implementation status and a short summary of changed files and test results. Keep all secrets out of prompt files and Git.

### Final report
Tell me which files changed, how the destination URL is generated, whether the checks passed, and any issues that remain. Do not modify unrelated features or commit/push automatically.

---

## Implementation Summary

Added a **Get Directions ↗** anchor link to each stop card in the Chronological Outing Timeline section. The link appears below the "Visitor Note" amber info box, uses Lucide's `ExternalLink` icon, and opens Google Maps directions in a new tab. No new dependencies, no API key, no paid integration.

**URL generation logic** (`buildGoogleMapsDirectionsUrl`):
- Reads `destination.coordinates.lat` / `.lng` from the existing type.
- If both values are finite and non-zero (i.e., real GeoJSON/Supabase coordinates), the URL uses `destination=lat,lng` — precise pin on the map.
- Falls back to `encodeURIComponent(destination.name)` as a text search query if coordinates are zero or invalid.
- Origin is **omitted** intentionally: `itinerary.startingLocation` is a display name string (e.g., "Shivajinagar / FC Road"), not a coordinate pair. Omitting origin lets Google Maps auto-use the user's current location.

## Changed / Created Files

| File | Change |
|------|--------|
| `src/components/TripResultView.tsx` | Added `ExternalLink` import, `Destination` type import, `buildGoogleMapsDirectionsUrl()` helper, and the **Get Directions ↗** `<a>` element inside each stop card |
| `prompts/2026-10-20-google-maps-directions.md` | Created (this file) — prompt archive |

No other files were modified.

## Verification & Build Results

| Check | Result |
|-------|--------|
| `npm run lint` (TypeScript `--noEmit`) | ✅ Exit code 0 — no type errors |
| `npm run build` (Vite production bundle) | ✅ Exit code 0 — built in ~13s |
| Vite chunk size warning | ⚠️ Pre-existing warning about JS bundle >500 kB — not introduced by this change |
| `__dirname` in `vite.config.ts` | ⚠️ Pre-existing Vite native loader warning — not introduced by this change |

No secrets, coordinates, or API keys are stored in this file or in Git.

