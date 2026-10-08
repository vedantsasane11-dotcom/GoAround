export type TransportMode = 'two_wheeler' | 'metro_bus' | 'cab_auto' | 'own_car';

export type TripDuration = 4 | 8 | 12 | 24;

export interface Destination {
  id: string;
  name: string;
  area: string;
  category: 'nature' | 'heritage' | 'food_cafe' | 'scenic_view' | 'adventure';
  tagline: string;
  description: string;
  whySelectedText: string;
  costPerPerson: number;
  suggestedDurationMinutes: number;
  imageUrl: string;
  tags: string[];
  crowdLevel: 'Low' | 'Moderate' | 'High';
  bestTimeOfDay: 'Early Morning' | 'Mid Morning' | 'Afternoon' | 'Sunset' | 'Evening';
  localTip: string;
  coordinates: {
    lat: number;
    lng: number;
  };
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
  estimatedCost: number;
  reasonForPick: string;
  insiderTip: string;
}

export interface BudgetCategory {
  name: string;
  amount: number;
  percent: number;
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
  coverImage: string;
  stops: ItineraryStop[];
  budgetBreakdown: BudgetCategory[];
  practicalNotes: string[];
  createdAt: string;
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
