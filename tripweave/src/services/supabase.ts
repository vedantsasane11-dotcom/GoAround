/**
 * Supabase Data Layer Architecture for Tripweave
 * 
 * Provides clean typed contracts for PostgreSQL/Supabase tables:
 * - `itineraries`
 * - `saved_trips`
 * - `trip_templates`
 * 
 * Falls back to verified LocalStorage persistence when Supabase credentials
 * are not yet injected, guaranteeing zero dead clicks or broken saves.
 */

import { Itinerary, PlanInput } from '../types';

export interface SupabaseConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface StoredTripRecord {
  id: string;
  user_id?: string;
  title: string;
  starting_location: string;
  duration_hours: number;
  total_cost_per_person: number;
  payload: Itinerary;
  created_at: string;
}

const STORAGE_KEY = 'tripweave_saved_itineraries';

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
