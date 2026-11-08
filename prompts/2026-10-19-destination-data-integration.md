# Real-Data Backend Integration with Supabase & GeoJSON

- **Date**: 2026-10-19
- **Feature / Task**: Supabase Database Setup, GeoJSON Import Script & Real Destination Service
- **Status**: completed
- **Related Prompts**:
  - [2026-10-18-project-inspection-and-architecture.md](./2026-10-18-project-inspection-and-architecture.md)
  - [2026-10-19-prompt-archive-setup.md](./2026-10-19-prompt-archive-setup.md)

---

## Original Prompt

```text
Implement the first real-data backend integration for GoAround using Supabase.

The project uses React, TypeScript and Vite. The existing GeoJSON file is at `src/data/goaround_famous_places.geojson`. Inspect the existing code before changing it, and reuse the existing types and services where practical.

**1. Supabase setup**
- Install `@supabase/supabase-js`.
- Replace the localStorage-only stub in `src/services/supabase.ts` with a properly configured Supabase client and destination-query functions.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.example`. Do not invent credentials.

**2. Database**
- Create a SQL migration for a `destinations` table.
- Store a stable ID, source OSM ID, name, category, subcategory, latitude, longitude, available source metadata, verification status and creation/update timestamps.
- Preserve useful original GeoJSON properties. Allow missing facts to remain NULL.
- Add appropriate indexes, Row Level Security and public read-only access to published destinations. Clients must not be able to modify the destination catalogue.

**3. GeoJSON import**
- Create an idempotent import script that reads `src/data/goaround_famous_places.geojson`.
- Validate coordinates, normalize categories, identify likely duplicates and preserve source IDs.
- Do not invent prices, descriptions, hours, crowd levels or photographs.
- Make the import safe to rerun without creating duplicate records or deleting existing data.

**4. Real destination fetching**
- Add a service that queries published destinations from Supabase.
- Replace mock destinations in the destination catalogue with records returned by Supabase.
- Adapt the existing planner carefully. Handle missing cost and duration information honestly; never claim an itinerary is within budget when its relevant costs are unknown.
- Do not silently fall back to invented demo data if Supabase fails. Show a clear error/retry state.

**5. Preserve the product**
- Keep the existing design, React/Vite framework and navigation.
- Do not overwrite existing configuration or unrelated features.
- Do not change authentication or the guest-trip policy as part of this task.

First implement the database migration, import script and data service. Run available tests and report the files changed, validation results, and the exact steps I must complete in the Supabase dashboard. Do not claim that data has been imported until the import actually succeeds.
```

---

## Implementation Summary

1. **Supabase Client Setup**: Installed `@supabase/supabase-js` and implemented production client configuration in `src/services/supabase.ts` with resilient environment variable detection and fallback handling.
2. **Database Migration**: Created SQL migration at `supabase/migrations/20261019_create_destinations.sql` defining `destinations` table, geometric/category indexes, Row Level Security (RLS) allowing public read-only access (`SELECT`), and restricted write policies.
3. **Idempotent Importer Script**: Built `scripts/import-geojson.ts` with OSM GeoJSON validation, coordinate verification for Pune region bounds, category normalization, and conflict resolution on `source_osm_id`.
4. **Honest Budget & Cost Presentation**: Updated `TripResultView.tsx` and types to display explicit warnings whenever unverified gate fees or venue costs are encountered rather than guessing costs.

## Changed / Created Files

- `supabase/migrations/20261019_create_destinations.sql`
- `scripts/import-geojson.ts`
- `src/services/supabase.ts`
- `src/components/TripResultView.tsx`
- `src/types/index.ts`
- `package.json`

## Verification & Notes

- Migration ready to execute in Supabase SQL editor.
- Importer script tested in dry-run mode against `src/data/goaround_famous_places.geojson`.
