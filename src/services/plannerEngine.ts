import { PlanInput, Itinerary, ItineraryStop, Destination, BudgetCategory } from '../types';
import { ALL_DESTINATIONS, PUNE_STARTING_HUBS, imgHeroSahyadri } from '../data/puneDestinations';

/**
 * Calculates straight-line Haversine distance between two coordinates in kilometers.
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimates driving / road distance factoring Pune terrain and road tortuosity (~1.35x).
 */
export function estimateRoadDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const straightLine = haversineDistanceKm(lat1, lon1, lat2, lon2);
  return Math.max(2, Math.round(straightLine * 1.35));
}

export function generateItinerary(
  input: PlanInput,
  availableDestinations?: Destination[]
): Itinerary {
  const startHub = PUNE_STARTING_HUBS.find(h => h.id === input.startingLocation) || PUNE_STARTING_HUBS[0];
  const pool = availableDestinations && availableDestinations.length > 0 ? availableDestinations : ALL_DESTINATIONS;

  // 1. Filter spots based on budget and things to avoid
  const candidates = pool.filter(dest => {
    // Avoid heavy trekking if user specified
    if (
      input.thingsToAvoid.includes('strenuous_trekking') &&
      (dest.id === 'sinhagad_fort' || dest.subcategory === 'fort' || dest.tags?.includes('Trek')) &&
      input.transportMode === 'metro_bus'
    ) {
      return false;
    }
    // Avoid expensive dining
    if (
      input.thingsToAvoid.includes('overpriced_dining') &&
      dest.costPerPerson !== null &&
      dest.costPerPerson !== undefined &&
      dest.costPerPerson > 300 &&
      input.budgetPerPerson < 700
    ) {
      return false;
    }
    return true;
  });

  // 2. Score candidates based on user interests and distance to start hub
  const scored = candidates.map(dest => {
    let score = 1;
    const destCategory = dest.category.toLowerCase();

    if (input.interests.includes('nature') && (destCategory === 'nature' || dest.subcategory === 'park')) score += 5;
    if (input.interests.includes('heritage') && (destCategory === 'heritage' || dest.subcategory === 'fort' || dest.subcategory === 'castle')) score += 5;
    if (input.interests.includes('food_cafe') && destCategory === 'food_cafe') score += 5;
    if (input.interests.includes('scenic_view') && (destCategory === 'scenic_view' || dest.subcategory === 'viewpoint')) score += 5;
    if (input.interests.includes('adventure') && (destCategory === 'adventure' || dest.subcategory === 'theme_park')) score += 5;

    // Prefer places within reasonable travel reach from starting hub
    const distToHub = estimateRoadDistanceKm(
      startHub.coordinates.lat,
      startHub.coordinates.lng,
      dest.coordinates.lat,
      dest.coordinates.lng
    );

    // If trip duration is short (4h), heavily penalize far destinations (> 35km)
    if (input.timeAvailableHours <= 4 && distToHub > 35) score -= 6;
    if (input.timeAvailableHours <= 8 && distToHub > 65) score -= 4;

    return { dest, score, distToHub };
  });

  scored.sort((a, b) => b.score - a.score);

  // 3. Determine how many stops based on time available
  let targetStopCount = 3;
  if (input.timeAvailableHours <= 4) targetStopCount = 2;
  else if (input.timeAvailableHours <= 8) targetStopCount = 3;
  else if (input.timeAvailableHours <= 12) targetStopCount = 4;
  else targetStopCount = 4; // overnight/weekend

  // Pick top varied stops (ensure diversity in category)
  const selectedSpots: Destination[] = [];
  const selectedCategories = new Set<string>();

  for (const item of scored) {
    if (selectedSpots.length >= targetStopCount) break;
    if (selectedSpots.length > 0 && selectedCategories.has(item.dest.category) && selectedSpots.length < 2) {
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

  // 4. Order stops logically by time of day or proximity to create an efficient circuit
  const timeOrderMap: Record<string, number> = {
    'Early Morning': 1,
    'Mid Morning': 2,
    'Afternoon': 3,
    'Sunset': 4,
    'Evening': 5,
  };

  selectedSpots.sort((a, b) => {
    const timeA = a.bestTimeOfDay ? timeOrderMap[a.bestTimeOfDay] || 3 : 3;
    const timeB = b.bestTimeOfDay ? timeOrderMap[b.bestTimeOfDay] || 3 : 3;
    return timeA - timeB;
  });

  // 5. Build timeline
  let currentHour = input.timeAvailableHours >= 8 ? 8 : 13; // 8 AM or 1 PM
  let currentMinute = 0;
  const stops: ItineraryStop[] = [];
  let totalDistanceKm = 0;
  let verifiedActivityCost = 0;
  const unverifiedCostStops: string[] = [];

  for (let i = 0; i < selectedSpots.length; i++) {
    const spot = selectedSpots[i];
    // Honest handling of duration: default to 75m for scheduling if unknown
    const duration = spot.suggestedDurationMinutes && spot.suggestedDurationMinutes > 0 ? spot.suggestedDurationMinutes : 75;
    const startStr = formatTime(currentHour, currentMinute);

    // Advance time for visit
    const endMinutesTotal = currentHour * 60 + currentMinute + duration;
    const endHour = Math.floor(endMinutesTotal / 60);
    const endMin = endMinutesTotal % 60;
    const endStr = formatTime(endHour, endMin);

    // Calculate transit to next stop or from starting point
    let distanceToNext = 10;
    let travelTimeToNext = 25;
    let transitNote = 'Direct connection across Pune bypass';

    if (i < selectedSpots.length - 1) {
      const nextSpot = selectedSpots[i + 1];
      distanceToNext = estimateRoadDistanceKm(
        spot.coordinates.lat,
        spot.coordinates.lng,
        nextSpot.coordinates.lat,
        nextSpot.coordinates.lng
      );
      travelTimeToNext = calculateTransitMinutes(distanceToNext, input.transportMode);
      transitNote = getTransitAdvice(input.transportMode, distanceToNext);
      totalDistanceKm += distanceToNext;

      // Advance clock for transit
      const afterTransitMin = endMinutesTotal + travelTimeToNext;
      currentHour = Math.floor(afterTransitMin / 60);
      currentMinute = afterTransitMin % 60;
    } else {
      // First leg from hub to stop 0
      const firstLegDist = estimateRoadDistanceKm(
        startHub.coordinates.lat,
        startHub.coordinates.lng,
        selectedSpots[0].coordinates.lat,
        selectedSpots[0].coordinates.lng
      );
      totalDistanceKm += firstLegDist;
    }

    // Honest handling of cost: DO NOT invent a cost or treat unverified as ₹0
    const isCostVerified = spot.costPerPerson !== null && spot.costPerPerson !== undefined;
    if (isCostVerified) {
      verifiedActivityCost += spot.costPerPerson!;
    } else {
      unverifiedCostStops.push(spot.name);
    }

    stops.push({
      stopNumber: i + 1,
      destination: spot,
      startTime: startStr,
      endTime: endStr,
      durationMinutes: duration,
      travelTimeToNextMinutes: i < selectedSpots.length - 1 ? travelTimeToNext : undefined,
      distanceToNextKm: i < selectedSpots.length - 1 ? distanceToNext : undefined,
      transitNotesToNext: i < selectedSpots.length - 1 ? transitNote : undefined,
      estimatedCost: isCostVerified ? spot.costPerPerson! : null,
      costUnverified: !isCostVerified,
      reasonForPick: spot.whySelectedText || `Curated ${spot.category.replace('_', ' ')} spot located in ${spot.area || 'the Pune region'}.`,
      insiderTip: spot.localTip || 'UPI works almost everywhere; keep ₹200 cash handy for local parking and village stalls.',
    });
  }

  // 6. Calculate realistic transport & food cost per person
  const transportCost = calculateTransportCost(input.transportMode, totalDistanceKm, input.groupSize);
  const foodCost = Math.round(Math.max(180, input.budgetPerPerson * 0.35));
  const bufferCost = Math.round(Math.max(50, (input.budgetPerPerson - (transportCost + foodCost + verifiedActivityCost)) * 0.4));
  const finalTotalCost = transportCost + foodCost + verifiedActivityCost + Math.max(0, bufferCost);

  const hasUnverifiedCosts = unverifiedCostStops.length > 0;

  const budgetBreakdown: BudgetCategory[] = [
    { name: 'Transport & Fuel/Fare', amount: transportCost, percent: Math.round((transportCost / finalTotalCost) * 100) },
    { name: 'Food, Chai & Meals (Est.)', amount: foodCost, percent: Math.round((foodCost / finalTotalCost) * 100), isEstimate: true },
  ];

  if (verifiedActivityCost > 0) {
    budgetBreakdown.push({
      name: 'Verified Entry & Activities',
      amount: verifiedActivityCost,
      percent: Math.round((verifiedActivityCost / finalTotalCost) * 100),
    });
  }

  if (hasUnverifiedCosts) {
    budgetBreakdown.push({
      name: `Unverified Gate Fees (${unverifiedCostStops.length} stops)`,
      amount: 0,
      percent: 0,
      isUnverified: true,
    });
  }

  budgetBreakdown.push({
    name: 'Buffer / Contingency',
    amount: Math.max(50, bufferCost),
    percent: Math.round((Math.max(50, bufferCost) / finalTotalCost) * 100),
    isEstimate: true,
  });

  const itineraryTitle = `${startHub.name.split('/')[0].trim()} to ${selectedSpots[selectedSpots.length - 1].name}`;
  
  // Honest tagline: NEVER claim within budget if costs are unknown
  const tagline = hasUnverifiedCosts
    ? `${input.timeAvailableHours}-hour outing from ${startHub.name.split('/')[0].trim()} · Travel & food estimated (entry fees may vary)`
    : `A smooth ${input.timeAvailableHours}-hour day out planned around a ₹${input.budgetPerPerson} budget`;

  const coverImage = selectedSpots[0]?.imageUrl || imgHeroSahyadri;

  const practicalNotes = [
    `Travel times are estimated for ${getTransportLabel(input.transportMode).toLowerCase()} on actual Pune roads.`,
    'UPI works at almost all stops, but keep ₹200–300 in cash handy for parking and local stalls.',
    'Starting a bit earlier in the morning helps you beat traffic near Chandani Chowk and Swargate.',
  ];

  if (hasUnverifiedCosts) {
    practicalNotes.unshift(
      `Note: Entry ticket fees for ${unverifiedCostStops.join(', ')} may vary. Please check gate prices on arrival.`
    );
  }

  return {
    id: `trip_${Date.now()}`,
    title: itineraryTitle,
    tagline,
    summary: `Planned starting from ${startHub.name} for ${input.groupSize} ${input.groupSize === 1 ? 'person' : 'people'}. Features ${stops.length} curated stops balancing sightseeing, great food, and realistic travel times without unnecessary back-and-forth.`,
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
    hasUnverifiedCosts,
    unverifiedCostNote: hasUnverifiedCosts
      ? `${unverifiedCostStops.length} destination(s) do not have fixed ticket prices listed (${unverifiedCostStops.join(', ')}). Total budget excludes on-site gate admission.`
      : undefined,
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
      return Math.round(Math.max(80, (totalDistKm * 2.8) / Math.min(groupSize, 2)));
    case 'metro_bus':
      return Math.round(Math.min(120, totalDistKm * 1.5 + 40));
    case 'cab_auto':
      return Math.round(Math.max(140, (totalDistKm * 18) / Math.min(groupSize, 4)));
    case 'own_car':
    default:
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
      return `${distKm} km · Book Uber/Ola Auto; confirm flat rate if crossing toll points.`;
    case 'own_car':
    default:
      return `${distKm} km · Smooth arterial bypass; watch for village speed breakers.`;
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
