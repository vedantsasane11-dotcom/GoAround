export type TransportMode = 'two_wheeler' | 'metro_bus' | 'cab_auto' | 'own_car';

export type TripDuration = 4 | 8 | 12 | 24;

export interface Destination {
  id: string;
  sourceOsmId?: string;
  name: string;
  area?: string | null;
  category: 'nature' | 'heritage' | 'food_cafe' | 'scenic_view' | 'adventure' | string;
  subcategory?: string | null;
  tagline?: string | null;
  description?: string | null;
  whySelectedText?: string | null;
  costPerPerson?: number | null; // null if unknown/unverified
  suggestedDurationMinutes?: number | null; // null if unverified
  imageUrl?: string | null; // null if unverified
  tags?: string[];
  crowdLevel?: 'Low' | 'Moderate' | 'High' | string | null;
  bestTimeOfDay?: 'Early Morning' | 'Mid Morning' | 'Afternoon' | 'Sunset' | 'Evening' | string | null;
  localTip?: string | null;
  coordinates: {
    lat: number;
    lng: number;
  };
  metadata?: Record<string, unknown> | null;
  verificationStatus?: 'candidate' | 'verified' | 'published' | 'archived';
  isPublished?: boolean;
}

export interface PlanInput {
  startingLocation: string;
  timeAvailableHours: TripDuration;
  budgetPerPerson: number;
  groupSize: number;
  transportMode: TransportMode;
  interests: string[];
  thingsToAvoid: string[];
}

export interface ItineraryStop {
  stopNumber: number;
  destination: Destination;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  travelTimeToNextMinutes?: number;
  distanceToNextKm?: number;
  transitNotesToNext?: string;
  estimatedCost: number | null; // null if unverified
  costUnverified?: boolean;
  reasonForPick?: string;
  insiderTip?: string;
}

export interface BudgetCategory {
  name: string;
  amount: number;
  percent: number;
  isEstimate?: boolean;
  isUnverified?: boolean;
}

export interface Itinerary {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  startingLocation: string;
  totalDurationHours: number;
  totalEstimatedCostPerPerson: number;
  totalDistanceKm: number;
  groupSize: number;
  transportMode: TransportMode;
  coverImage?: string;
  stops: ItineraryStop[];
  budgetBreakdown: BudgetCategory[];
  practicalNotes: string[];
  createdAt: string;
  hasUnverifiedCosts?: boolean;
  unverifiedCostNote?: string;
}

export interface TripTemplate {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  estimatedCost: number;
  durationString: string;
  durationHours: TripDuration;
  category: string;
  imageUrl: string;
  highlights: string[];
  defaults: PlanInput;
}

export interface StartingHub {
  id: string;
  name: string;
  area: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
