/**
 * Supabase Data Layer Architecture for GoAround
 * 
 * Provides:
 * 1. Initialized Supabase client for PostgreSQL database.
 * 2. Query function for published real destinations.
 * 3. LocalStorage persistence for guest-first trip saving.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Destination, Itinerary } from '../types';

// Read environment variables injected by Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Returns true only when real, non-placeholder credentials have been configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    rawUrl &&
    rawAnonKey &&
    !rawUrl.includes('your-project') &&
    rawUrl.startsWith('https://') &&
    rawAnonKey !== 'your-anon-key'
  );
};

// Singleton client instance (null when unconfigured)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(rawUrl, rawAnonKey)
  : null;

export interface FetchDestinationsResult {
  data: Destination[];
  error: string | null;
}

/**
 * Queries published real destinations from Supabase PostgreSQL.
 * Returns { data, error }. Never silently provides mock data on failure.
 */
export async function fetchPublishedDestinations(): Promise<FetchDestinationsResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      data: [],
      error: 'Supabase is not configured. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart Vite.'
    };
  }

  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_published', true)
      .order('name', { ascending: true });

    if (error) {
      return {
        data: [],
        error: `Supabase database error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`
      };
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        error: 'No published destinations found in Supabase. Run the database migration and the GeoJSON import script.'
      };
    }

    // Map database snake_case columns to typed Destination models
    const mapped: Destination[] = data.map((row: any) => ({
      id: row.id,
      sourceOsmId: row.source_osm_id,
      name: row.name,
      area: row.area || 'Pune Region',
      category: row.category,
      subcategory: row.subcategory || null,
      tagline: row.tagline || null,
      description: row.description || null,
      whySelectedText: row.why_selected_text || null,
      costPerPerson: row.cost_per_person !== null && row.cost_per_person !== undefined ? Number(row.cost_per_person) : null,
      suggestedDurationMinutes: row.suggested_duration_minutes !== null && row.suggested_duration_minutes !== undefined ? Number(row.suggested_duration_minutes) : null,
      imageUrl: row.image_url || null,
      tags: Array.isArray(row.tags) ? row.tags : [],
      crowdLevel: row.crowd_level || null,
      bestTimeOfDay: row.best_time_of_day || null,
      localTip: row.local_tip || null,
      coordinates: {
        lat: Number(row.latitude),
        lng: Number(row.longitude)
      },
      metadata: row.metadata || null,
      verificationStatus: row.verification_status,
      isPublished: row.is_published
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return {
      data: [],
      error: `Connection error fetching destinations: ${err.message || String(err)}`
    };
  }
}

// ============================================================================
// Guest-First Trip Persistence Service (LocalStorage)
// ============================================================================

const STORAGE_KEY = 'goaround_saved_itineraries';

export const tripStorageService = {
  // Save an itinerary
  async saveItinerary(itinerary: Itinerary): Promise<boolean> {
    try {
      const existing = this.getSavedItineraries();
      const filtered = existing.filter(item => item.id !== itinerary.id);
      filtered.unshift(itinerary);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.warn('LocalStorage save error:', err);
      return false;
    }
  },

  // Get all saved itineraries
  getSavedItineraries(): Itinerary[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Itinerary[];
    } catch (err) {
      console.warn('LocalStorage read error:', err);
      return [];
    }
  },

  // Remove saved itinerary
  removeItinerary(id: string): boolean {
    try {
      const existing = this.getSavedItineraries();
      const filtered = existing.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  // Check if saved
  isSaved(id: string): boolean {
    const existing = this.getSavedItineraries();
    return existing.some(item => item.id === id);
  },
};
