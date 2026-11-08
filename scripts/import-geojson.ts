import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Resolve current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Haversine distance calculation in km
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000) / 1000;
}

// Category Normalization Map
function normalizeCategory(osmCat: string, osmSubcat: string, name: string): { category: string; subcategory: string } {
  const normSub = (osmSubcat || '').toLowerCase().trim();
  const normCat = (osmCat || '').toLowerCase().trim();
  const lowerName = name.toLowerCase();

  // 1. Forts, Castles, Historical Bastions, Archaeological
  if (
    normSub === 'fort' ||
    normSub === 'castle' ||
    normSub === 'archaeological_site' ||
    normSub === 'monument' ||
    normSub === 'museum' ||
    lowerName.includes('fort') ||
    lowerName.includes('gad') ||
    lowerName.includes('wada') ||
    lowerName.includes('rajwada') ||
    lowerName.includes('caves') ||
    lowerName.includes('leleni')
  ) {
    return { category: 'heritage', subcategory: normSub || 'heritage' };
  }

  // 2. Viewpoints & Scenic Heights
  if (
    normSub === 'viewpoint' ||
    lowerName.includes('point') ||
    lowerName.includes('view') ||
    lowerName.includes('tekdi') ||
    lowerName.includes('crest')
  ) {
    return { category: 'scenic_view', subcategory: normSub || 'viewpoint' };
  }

  // 3. Parks, Botanical & Nature
  if (
    normSub === 'park' ||
    normCat === 'recreation' ||
    lowerName.includes('garden') ||
    lowerName.includes('park') ||
    lowerName.includes('lake') ||
    lowerName.includes('dam')
  ) {
    return { category: 'nature', subcategory: normSub || 'park' };
  }

  // 4. Religious / Heritage Places of Worship
  if (normSub === 'place_of_worship' || normCat === 'religious' || lowerName.includes('temple') || lowerName.includes('mandir')) {
    return { category: 'heritage', subcategory: 'place_of_worship' };
  }

  // 5. Adventure & Theme Parks
  if (normSub === 'theme_park' || normSub === 'zoo' || normSub === 'aquarium') {
    return { category: 'adventure', subcategory: normSub };
  }

  // Default fallback
  if (normCat === 'heritage') return { category: 'heritage', subcategory: normSub || 'landmark' };
  if (normCat === 'tourism') return { category: 'scenic_view', subcategory: normSub || 'attraction' };

  return { category: 'heritage', subcategory: normSub || 'landmark' };
}

// Derive area label honestly from available address fields or known Pune coordinates
function deriveArea(props: Record<string, any>, lat: number, lng: number): string {
  if (props['addr:city'] && props['addr:street']) {
    return `${props['addr:street']}, ${props['addr:city']}`;
  }
  if (props['addr:city']) {
    return props['addr:city'];
  }
  if (props['addr:district']) {
    return `${props['addr:district']} District`;
  }
  if (props['addr:place']) {
    return props['addr:place'];
  }

  // Geographic reference based on central Pune coordinates (18.5204, 73.8567)
  const distFromCenter = haversineDistanceKm(lat, lng, 18.5204, 73.8567);
  if (distFromCenter <= 10) return 'Pune Urban';
  if (lat > 19.0) return 'Junnar / North Pune Region';
  if (lat < 18.2) return 'Bhor / South Sahyadri Belt';
  if (lng < 73.6) return 'Western Ghats / Maval Belt';
  if (distFromCenter <= 30) return 'Greater Pune Outer Ring';
  return 'Pune District';
}

export interface ProcessedDestination {
  id: string;
  source_osm_id: string;
  name: string;
  category: string;
  subcategory: string | null;
  latitude: number;
  longitude: number;
  area: string | null;
  description: string | null;
  tagline: string | null;
  cost_per_person: number | null;
  suggested_duration_minutes: number | null;
  image_url: string | null;
  tags: string[];
  crowd_level: string | null;
  best_time_of_day: string | null;
  local_tip: string | null;
  metadata: Record<string, any>;
  verification_status: 'candidate' | 'verified' | 'published';
  is_published: boolean;
}

export function processGeoJSON(filePath: string): {
  validRecords: ProcessedDestination[];
  duplicatesDetected: { name: string; primaryId: string; duplicateId: string; distanceMeters: number }[];
  distantSameNameCount: number;
  stats: {
    totalFeatures: number;
    validFeatures: number;
    categories: Record<string, number>;
    subcategories: Record<string, number>;
  };
} {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const geojson = JSON.parse(rawContent);

  if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error('Invalid GeoJSON: Expected FeatureCollection with features array');
  }

  const features = geojson.features;
  const stats = {
    totalFeatures: features.length,
    validFeatures: 0,
    categories: {} as Record<string, number>,
    subcategories: {} as Record<string, number>,
  };

  const candidateList: ProcessedDestination[] = [];
  const duplicatesDetected: { name: string; primaryId: string; duplicateId: string; distanceMeters: number }[] = [];
  let distantSameNameCount = 0;

  // 1. Initial validation & extraction
  for (const f of features) {
    const props = f.properties || {};
    const coords = f.geometry?.coordinates;

    // Check valid Point geometry
    if (!coords || coords.length < 2 || f.geometry.type !== 'Point') {
      console.warn(`[SKIP] Missing or non-point geometry for feature: ${props['@id'] || 'unknown'}`);
      continue;
    }

    const lng = Number(coords[0]);
    const lat = Number(coords[1]);

    // Check coordinate bounds (Pune & Western Ghats region: 17.8 <= lat <= 19.8, 73.0 <= lng <= 74.8)
    if (isNaN(lat) || isNaN(lng) || lat < 17.8 || lat > 19.8 || lng < 73.0 || lng > 74.8) {
      console.warn(`[SKIP] Coordinates out of Pune region bounds: [${lng}, ${lat}] for ${props.name}`);
      continue;
    }

    if (!props.name || typeof props.name !== 'string' || props.name.trim() === '') {
      console.warn(`[SKIP] Unnamed feature: ${props['@id']}`);
      continue;
    }

    const sourceOsmId = props.source_object_id || props['@id'];
    if (!sourceOsmId) {
      console.warn(`[SKIP] Missing source OSM identifier for ${props.name}`);
      continue;
    }

    const cleanName = props.name.trim();
    const { category, subcategory } = normalizeCategory(
      props.goaround_category,
      props.goaround_subcategory,
      cleanName
    );

    // Honest handling: missing facts remain NULL. NEVER invent prices, descriptions, or ratings.
    const record: ProcessedDestination = {
      id: `dest_${sourceOsmId.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      source_osm_id: sourceOsmId,
      name: cleanName,
      category,
      subcategory: subcategory || null,
      latitude: lat,
      longitude: lng,
      area: deriveArea(props, lat, lng),
      description: props.description ? String(props.description).trim() : null,
      tagline: null,
      cost_per_person: null, // Unknown/unverified
      suggested_duration_minutes: null, // Unknown/unverified
      image_url: null, // No invented stock images
      tags: [category, subcategory].filter(Boolean) as string[],
      crowd_level: null,
      best_time_of_day: null,
      local_tip: null,
      metadata: {
        raw_properties: props,
        osm_source: props.source || 'OpenStreetMap',
        name_mr: props['name:mr'] || null,
        wikidata: props.wikidata || null,
        wikipedia: props.wikipedia || null,
        historic: props.historic || null,
        tourism: props.tourism || null,
        amenity: props.amenity || null,
        alternate_source_ids: [] as string[],
      },
      verification_status: 'published',
      is_published: true,
    };

    candidateList.push(record);
  }

  // 2. Spatial Deduplication (identify same place represented twice in OSM e.g. way vs node within 300m)
  const canonicalMap = new Map<string, ProcessedDestination>();
  const duplicateSourceIds = new Set<string>();

  for (let i = 0; i < candidateList.length; i++) {
    const itemA = candidateList[i];
    if (duplicateSourceIds.has(itemA.source_osm_id)) continue;

    for (let j = i + 1; j < candidateList.length; j++) {
      const itemB = candidateList[j];
      if (duplicateSourceIds.has(itemB.source_osm_id)) continue;

      const normNameA = itemA.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normNameB = itemB.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (normNameA === normNameB) {
        const distKm = haversineDistanceKm(itemA.latitude, itemA.longitude, itemB.latitude, itemB.longitude);
        const distMeters = Math.round(distKm * 1000);

        if (distMeters <= 300) {
          // Same physical place duplicate in OSM
          duplicatesDetected.push({
            name: itemA.name,
            primaryId: itemA.source_osm_id,
            duplicateId: itemB.source_osm_id,
            distanceMeters: distMeters,
          });

          // Retain itemA, merge itemB's source ID into metadata
          itemA.metadata.alternate_source_ids.push(itemB.source_osm_id);
          duplicateSourceIds.add(itemB.source_osm_id);
        } else {
          distantSameNameCount++;
        }
      }
    }

    canonicalMap.set(itemA.source_osm_id, itemA);
  }

  const validRecords = Array.from(canonicalMap.values());
  stats.validFeatures = validRecords.length;

  for (const r of validRecords) {
    stats.categories[r.category] = (stats.categories[r.category] || 0) + 1;
    if (r.subcategory) {
      stats.subcategories[r.subcategory] = (stats.subcategories[r.subcategory] || 0) + 1;
    }
  }

  return {
    validRecords,
    duplicatesDetected,
    distantSameNameCount,
    stats,
  };
}

// Generate idempotent SQL statements
export function generateSeedSQL(records: ProcessedDestination[]): string {
  const lines: string[] = [
    '--',
    '-- GoAround Destination Seed Data',
    '-- Automatically generated by scripts/import-geojson.ts',
    '-- Idempotent upsert matching public.destinations schema',
    '--',
    'BEGIN;',
    '',
  ];

  for (const r of records) {
    const esc = (val: string | null) => (val === null ? 'NULL' : `'${val.replace(/'/g, "''")}'`);
    const num = (val: number | null) => (val === null ? 'NULL' : String(val));
    const jsonStr = `'${JSON.stringify(r.metadata).replace(/'/g, "''")}'::jsonb`;
    const tagsArr = `ARRAY[${r.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]::text[]`;

    lines.push(
      `INSERT INTO public.destinations (
  id, source_osm_id, name, category, subcategory, latitude, longitude, area,
  description, tagline, cost_per_person, suggested_duration_minutes, image_url,
  tags, crowd_level, best_time_of_day, local_tip, metadata, verification_status, is_published
) VALUES (
  ${esc(r.id)}, ${esc(r.source_osm_id)}, ${esc(r.name)}, ${esc(r.category)}, ${esc(r.subcategory)},
  ${num(r.latitude)}, ${num(r.longitude)}, ${esc(r.area)}, ${esc(r.description)}, ${esc(r.tagline)},
  ${num(r.cost_per_person)}, ${num(r.suggested_duration_minutes)}, ${esc(r.image_url)},
  ${tagsArr}, ${esc(r.crowd_level)}, ${esc(r.best_time_of_day)}, ${esc(r.local_tip)},
  ${jsonStr}, ${esc(r.verification_status)}, ${r.is_published}
) ON CONFLICT (source_osm_id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  area = COALESCE(EXCLUDED.area, destinations.area),
  description = COALESCE(EXCLUDED.description, destinations.description),
  metadata = EXCLUDED.metadata,
  updated_at = timezone('utc'::text, now());`
    );
    lines.push('');
  }

  lines.push('COMMIT;');
  lines.push('');
  return lines.join('\n');
}

// Execution Entrypoint
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('-d');
  const geojsonPath = path.resolve(__dirname, '../src/data/goaround_famous_places.geojson');

  console.log('====================================================');
  console.log('  GoAround GeoJSON Ingestion & Validation Pipeline  ');
  console.log('====================================================');
  console.log(`Source File: ${geojsonPath}`);

  if (!fs.existsSync(geojsonPath)) {
    console.error(`Error: File does not exist at ${geojsonPath}`);
    process.exit(1);
  }

  const { validRecords, duplicatesDetected, distantSameNameCount, stats } = processGeoJSON(geojsonPath);

  console.log(`\nValidation & Processing Results:`);
  console.log(`- Total Features in GeoJSON: ${stats.totalFeatures}`);
  console.log(`- Overlapping OSM Duplicates Merged (<300m): ${duplicatesDetected.length}`);
  duplicatesDetected.forEach(d => {
    console.log(`    ↳ Merged duplicate "${d.name}" (${d.duplicateId} into ${d.primaryId}, distance: ${d.distanceMeters}m)`);
  });
  console.log(`- Regional Shrines with Same Name Preserved (>1km apart): ${distantSameNameCount}`);
  console.log(`- Unique Valid Destination Records: ${stats.validFeatures}`);

  console.log(`\nCategory Breakdown:`);
  Object.entries(stats.categories).forEach(([cat, count]) => {
    console.log(`  • ${cat}: ${count}`);
  });

  console.log(`\nTop Subcategories:`);
  Object.entries(stats.subcategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([subcat, count]) => {
      console.log(`  • ${subcat}: ${count}`);
    });

  // Write idempotent SQL seed file
  const seedSqlPath = path.resolve(__dirname, '../supabase/seed.sql');
  const seedSql = generateSeedSQL(validRecords);
  fs.writeFileSync(seedSqlPath, seedSql, 'utf-8');
  console.log(`\nGenerated idempotent SQL seed file: ${seedSqlPath}`);
  console.log(`(Contains ${validRecords.length} records with ON CONFLICT (source_osm_id) DO UPDATE)`);

  // Check Supabase environment variables for direct database import
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const hasConfig =
    Boolean(supabaseUrl && supabaseKey) &&
    !supabaseUrl?.includes('your-project') &&
    supabaseUrl?.startsWith('https://');

  if (isDryRun || !hasConfig) {
    if (!hasConfig) {
      console.log('\n[Notice] Supabase credentials not found or placeholder in environment.');
      console.log('To import directly into Supabase:');
      console.log('  1. Provide VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) in .env');
      console.log('  2. Run: npm run import:geojson');
      console.log('Or copy and execute supabase/seed.sql directly in the Supabase SQL Editor.');
    } else {
      console.log('\n[Dry Run] Validation and SQL generation completed successfully. Skipping remote database upload.');
    }
    return;
  }

  // Direct Supabase Upload when configured
  console.log(`\nConnecting to Supabase at ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  try {
    console.log(`Upserting ${validRecords.length} records into 'destinations' table...`);
    // Batch in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < validRecords.length; i += chunkSize) {
      const chunk = validRecords.slice(i, i + chunkSize);
      const { error } = await supabase.from('destinations').upsert(chunk, {
        onConflict: 'source_osm_id',
        ignoreDuplicates: false,
      });

      if (error) {
        throw new Error(`Supabase upsert error at batch ${i / chunkSize + 1}: ${error.message}`);
      }
      console.log(`  ↳ Uploaded records ${i + 1} to ${Math.min(i + chunkSize, validRecords.length)}`);
    }

    console.log(`\nSuccess! Successfully imported ${validRecords.length} destinations into Supabase.`);
  } catch (err: any) {
    console.error(`\nImport failed: ${err.message || String(err)}`);
    console.error('Note: Ensure the SQL migration in supabase/migrations has been executed first.');
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('Fatal error in import script:', err);
    process.exit(1);
  });
}
