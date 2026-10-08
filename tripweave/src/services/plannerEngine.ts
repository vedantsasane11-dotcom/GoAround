import { PlanInput, Itinerary, ItineraryStop, Destination, BudgetCategory } from '../types';
import { ALL_DESTINATIONS, PUNE_STARTING_HUBS, imgHeroSahyadri } from '../data/puneDestinations';

// Approximate distance matrix (km) between Pune starting points & destinations
const TRANSIT_DATA: Record<string, Record<string, { distKm: number; baseMin: number }>> = {
  fc_road: {
    sinhagad_fort: { distKm: 31, baseMin: 55 },
    vetal_tekdi: { distKm: 4, baseMin: 15 },
    panshet_backwaters: { distKm: 42, baseMin: 75 },
    fc_road_eats: { distKm: 0, baseMin: 0 },
    shaniwar_wada: { distKm: 3.5, baseMin: 12 },
    kp_artisanal_cafes: { distKm: 8, baseMin: 22 },
    pawna_lake_ridge: { distKm: 52, baseMin: 85 },
    sahyadri_viewpoint_ridge: { distKm: 65, baseMin: 105 },
  },
  kothrud: {
    sinhagad_fort: { distKm: 27, baseMin: 48 },
    vetal_tekdi: { distKm: 2.5, baseMin: 10 },
    panshet_backwaters: { distKm: 38, baseMin: 65 },
    fc_road_eats: { distKm: 5, baseMin: 15 },
    shaniwar_wada: { distKm: 6.5, baseMin: 20 },
    kp_artisanal_cafes: { distKm: 12, baseMin: 30 },
    pawna_lake_ridge: { distKm: 48, baseMin: 75 },
    sahyadri_viewpoint_ridge: { distKm: 60, baseMin: 95 },
  },
  hinjewadi: {
    sinhagad_fort: { distKm: 42, baseMin: 70 },
    vetal_tekdi: { distKm: 14, baseMin: 28 },
    panshet_backwaters: { distKm: 49, baseMin: 85 },
    fc_road_eats: { distKm: 16, baseMin: 32 },
    shaniwar_wada: { distKm: 18, baseMin: 38 },
    kp_artisanal_cafes: { distKm: 22, baseMin: 45 },
    pawna_lake_ridge: { distKm: 36, baseMin: 55 },
    sahyadri_viewpoint_ridge: { distKm: 75, baseMin: 115 },
  },
  viman_nagar: {
    sinhagad_fort: { distKm: 39, baseMin: 75 },
    vetal_tekdi: { distKm: 15, baseMin: 35 },
    panshet_backwaters: { distKm: 52, baseMin: 95 },
    fc_road_eats: { distKm: 11, baseMin: 30 },
    shaniwar_wada: { distKm: 9.5, baseMin: 26 },
    kp_artisanal_cafes: { distKm: 4.5, baseMin: 14 },
    pawna_lake_ridge: { distKm: 62, baseMin: 95 },
    sahyadri_viewpoint_ridge: { distKm: 72, baseMin: 120 },
  },
};

export function generateItinerary(input: PlanInput): Itinerary {
  const startHub = PUNE_STARTING_HUBS.find(h => h.id === input.startingLocation) || {
    id: 'fc_road',
    name: input.startingLocation || 'FC Road',
    area: 'Pune',
  };

  // 1. Filter spots based on budget and things to avoid
  let candidates = ALL_DESTINATIONS.filter(dest => {
    // Avoid heavy trekking if user specified
    if (input.thingsToAvoid.includes('strenuous_trekking') && dest.id === 'sinhagad_fort' && input.transportMode === 'metro_bus') {
      return false;
    }
    // Avoid expensive dining
    if (input.thingsToAvoid.includes('overpriced_dining') && dest.costPerPerson > 300 && input.budgetPerPerson < 700) {
      return false;
    }
    return true;
  });

  // 2. Score candidates based on user interests
  const scored = candidates.map(dest => {
    let score = 1;
    if (input.interests.includes('nature') && dest.category === 'nature') score += 4;
    if (input.interests.includes('heritage') && dest.category === 'heritage') score += 4;
    if (input.interests.includes('food_cafe') && dest.category === 'food_cafe') score += 4;
    if (input.interests.includes('sunset_lakes') && (dest.id === 'vetal_tekdi' || dest.id === 'panshet_backwaters' || dest.id === 'pawna_lake_ridge')) score += 5;
    if (input.interests.includes('adventure') && (dest.id === 'pawna_lake_ridge' || dest.id === 'sinhagad_fort')) score += 4;
    return { dest, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // 3. Determine how many stops based on time available
  let targetStopCount = 3;
  if (input.timeAvailableHours <= 4) targetStopCount = 2;
  else if (input.timeAvailableHours <= 8) targetStopCount = 3;
  else if (input.timeAvailableHours <= 12) targetStopCount = 4;
  else targetStopCount = 4; // overnight/weekend

  // Pick top varied stops (ensure not 3 food places in a row)
  const selectedSpots: Destination[] = [];
  const selectedCategories = new Set<string>();

  for (const item of scored) {
    if (selectedSpots.length >= targetStopCount) break;
    // Try to vary category unless user only chose one
    if (selectedSpots.length > 0 && selectedCategories.has(item.dest.category) && selectedSpots.length < 2) {
      // allow later if needed
      continue;
    }
    selectedSpots.push(item.dest);
    selectedCategories.add(item.dest.category);
  }

  // Fallback if needed
  if (selectedSpots.length < targetStopCount) {
    for (const item of scored) {
      if (!selectedSpots.some(s => s.id === item.dest.id)) {
        selectedSpots.push(item.dest);
      }
      if (selectedSpots.length >= targetStopCount) break;
    }
  }

  // 4. Order stops logically by time of day
  // Morning -> Midday/Lunch -> Afternoon -> Sunset/Evening
  const timeOrderMap: Record<string, number> = {
    'Early Morning': 1,
    'Mid Morning': 2,
    'Afternoon': 3,
    'Sunset': 4,
    'Evening': 5,
  };
  selectedSpots.sort((a, b) => (timeOrderMap[a.bestTimeOfDay] || 3) - (timeOrderMap[b.bestTimeOfDay] || 3));

  // 5. Build timeline
  let currentHour = input.timeAvailableHours >= 8 ? 8 : 13; // 8 AM or 1 PM
  let currentMinute = 0;
  const stops: ItineraryStop[] = [];
  let totalDistanceKm = 0;
  let totalActivityCost = 0;

  for (let i = 0; i < selectedSpots.length; i++) {
    const spot = selectedSpots[i];
    const duration = spot.suggestedDurationMinutes;
    const startStr = formatTime(currentHour, currentMinute);

    // Advance time
    const endMinutesTotal = currentHour * 60 + currentMinute + duration;
    const endHour = Math.floor(endMinutesTotal / 60);
    const endMin = endMinutesTotal % 60;
    const endStr = formatTime(endHour, endMin);

    // Calculate transit to next
    let travelTimeToNext = 25;
    let distanceToNext = 8;
    let transitNote = 'Direct connection';

    if (i < selectedSpots.length - 1) {
      const nextSpot = selectedSpots[i + 1];
      const startRef = TRANSIT_DATA[input.startingLocation] || TRANSIT_DATA['fc_road'];
      const spotEst = startRef?.[nextSpot.id];
      distanceToNext = spotEst ? Math.round(spotEst.distKm * 0.7 + 5) : 10;
      travelTimeToNext = calculateTransitMinutes(distanceToNext, input.transportMode);
      transitNote = getTransitAdvice(input.transportMode, distanceToNext);
      totalDistanceKm += distanceToNext;

      // Advance clock for transit
      const afterTransitMin = endMinutesTotal + travelTimeToNext;
      currentHour = Math.floor(afterTransitMin / 60);
      currentMinute = afterTransitMin % 60;
    }

    totalActivityCost += spot.costPerPerson;

    stops.push({
      stopNumber: i + 1,
      destination: spot,
      startTime: startStr,
      endTime: endStr,
      durationMinutes: duration,
      travelTimeToNextMinutes: i < selectedSpots.length - 1 ? travelTimeToNext : undefined,
      distanceToNextKm: i < selectedSpots.length - 1 ? distanceToNext : undefined,
      transitNotesToNext: i < selectedSpots.length - 1 ? transitNote : undefined,
      estimatedCost: spot.costPerPerson,
      reasonForPick: spot.whySelectedText,
      insiderTip: spot.localTip,
    });
  }

  // 6. Calculate realistic transport cost per person
  const transportCost = calculateTransportCost(input.transportMode, totalDistanceKm, input.groupSize);
  const foodCost = Math.round(Math.max(180, input.budgetPerPerson * 0.35));
  const entryCost = totalActivityCost;
  const bufferCost = Math.round(Math.max(50, (input.budgetPerPerson - (transportCost + foodCost + entryCost)) * 0.5));
  const finalTotalCost = transportCost + foodCost + entryCost + Math.max(0, bufferCost);

  const budgetBreakdown: BudgetCategory[] = [
    { name: 'Transport & Fuel/Fare', amount: transportCost, percent: Math.round((transportCost / finalTotalCost) * 100) },
    { name: 'Food, Chai & Snacks', amount: foodCost, percent: Math.round((foodCost / finalTotalCost) * 100) },
    { name: 'Entry, Parking & Activities', amount: entryCost, percent: Math.round((entryCost / finalTotalCost) * 100) },
    { name: 'Buffer / Contingency', amount: Math.max(50, bufferCost), percent: Math.round((Math.max(50, bufferCost) / finalTotalCost) * 100) },
  ];

  const itineraryTitle = `${startHub.name.split('/')[0].trim()} to ${selectedSpots[selectedSpots.length - 1].name}`;
  const tagline = `A realistic ${input.timeAvailableHours}-hour curated route calibrated for ₹${input.budgetPerPerson} budget`;

  const coverImage = selectedSpots[0]?.imageUrl || imgHeroSahyadri;

  const practicalNotes = [
    `Transit optimized for ${getTransportLabel(input.transportMode)}: estimated travel time covers Pune peak bottlenecks.`,
    'UPI payments are accepted at 95% of stalls, but carry ₹150–200 cash for rural parking and local ghat vendors.',
    'Early departures save up to 45 minutes in city-exit signal traffic near Chandani Chowk and Swargate.',
  ];

  return {
    id: `trip_${Date.now()}`,
    title: itineraryTitle,
    tagline,
    summary: `Designed starting from ${startHub.name} for a group of ${input.groupSize}. Features ${stops.length} distinct locations balancing scenic Sahyadri views, authentic local food stops, and zero wasted detour kilometers.`,
    startingLocation: startHub.name,
    totalDurationHours: input.timeAvailableHours,
    totalEstimatedCostPerPerson: finalTotalCost,
    totalDistanceKm: Math.max(14, totalDistanceKm),
    groupSize: input.groupSize,
    transportMode: input.transportMode,
    coverImage,
    stops,
    budgetBreakdown,
    practicalNotes,
    createdAt: new Date().toISOString(),
  };
}

function calculateTransitMinutes(distanceKm: number, mode: PlanInput['transportMode']): number {
  switch (mode) {
    case 'two_wheeler':
      return Math.round(distanceKm * 1.8 + 8);
    case 'metro_bus':
      return Math.round(distanceKm * 2.6 + 15);
    case 'cab_auto':
      return Math.round(distanceKm * 2.2 + 10);
    case 'own_car':
    default:
      return Math.round(distanceKm * 2.0 + 10);
  }
}

function calculateTransportCost(mode: PlanInput['transportMode'], totalDistKm: number, groupSize: number): number {
  switch (mode) {
    case 'two_wheeler':
      // Petrol: ~₹2.8/km divided by 1 or 2 riders
      return Math.round(Math.max(80, (totalDistKm * 2.8) / Math.min(groupSize, 2)));
    case 'metro_bus':
      // Flat metro/PMPML pass / ticket
      return Math.round(Math.min(120, totalDistKm * 1.5 + 40));
    case 'cab_auto':
      // Auto/cab ~₹18/km split by group
      return Math.round(Math.max(140, (totalDistKm * 18) / Math.min(groupSize, 4)));
    case 'own_car':
      // Fuel + parking split across group
      return Math.round(Math.max(110, (totalDistKm * 8 + 100) / Math.max(1, groupSize)));
  }
}

function getTransitAdvice(mode: PlanInput['transportMode'], distKm: number): string {
  switch (mode) {
    case 'two_wheeler':
      return `${distKm} km · Quick filter through local chowks; helmet mandatory on bypass.`;
    case 'metro_bus':
      return `${distKm} km · Combine PMPML feeder with Metro Line 1/2 where applicable.`;
    case 'cab_auto':
      return `${distKm} km · Book Uber/Ola Auto; pre-negotiate flat rate if crossing toll points.`;
    case 'own_car':
      return `${distKm} km · Smooth arterial bypass; watch for speed breakers in village limits.`;
  }
}

export function getTransportLabel(mode: PlanInput['transportMode']): string {
  switch (mode) {
    case 'two_wheeler':
      return 'Two-Wheeler (Motorcycle / Scooter)';
    case 'metro_bus':
      return 'Pune Metro & PMPML Bus';
    case 'cab_auto':
      return 'Cab & Auto Rickshaw';
    case 'own_car':
      return 'Own Car / Self-Drive';
  }
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = minute < 10 ? `0${minute}` : `${minute}`;
  return `${displayHour}:${displayMinute} ${period}`;
}
