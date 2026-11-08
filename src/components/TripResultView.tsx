import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  Printer,
  RotateCcw,
  Clock,
  IndianRupee,
  MapPin,
  Bike,
  Sparkles,
  Check,
  Compass,
  ArrowRight,
  Info,
  Lightbulb,
  Navigation,
  AlertTriangle,
  Landmark,
  Mountain,
  Trees,
  ExternalLink,
} from 'lucide-react';
import { Destination, Itinerary, ItineraryStop } from '../types';
import { getTransportLabel } from '../services/plannerEngine';

/**
 * Builds a Google Maps Directions URL for a destination.
 * Prefers lat/lng coordinates when valid (non-zero, finite).
 * Falls back to the destination name as a plain-text query.
 * Origin is intentionally omitted so Google Maps can use the
 * user's current location or let them choose their own start.
 */
function buildGoogleMapsDirectionsUrl(destination: Destination): string {
  const { lat, lng } = destination.coordinates;
  const hasValidCoords =
    isFinite(lat) && isFinite(lng) && (lat !== 0 || lng !== 0);

  const destinationParam = hasValidCoords
    ? `${lat},${lng}`
    : encodeURIComponent(destination.name);

  return `https://www.google.com/maps/dir/?api=1&destination=${destinationParam}`;
}

interface TripResultViewProps {
  itinerary: Itinerary;
  isSaved: boolean;
  onToggleSave: (itinerary: Itinerary) => void;
  onModifyPlan: () => void;
}

export const TripResultView: React.FC<TripResultViewProps> = ({
  itinerary,
  isSaved,
  onToggleSave,
  onModifyPlan,
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  const handleShare = async () => {
    try {
      const shareData = {
        title: `GoAround — ${itinerary.title}`,
        text: `Check out this realistic Pune outing: ${itinerary.title} (${itinerary.totalDurationHours}h · ₹${itinerary.totalEstimatedCostPerPerson}/person)`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      }
    } catch {
      // Fallback
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'heritage':
        return <Landmark className="w-8 h-8 text-amber-300" />;
      case 'scenic_view':
        return <Mountain className="w-8 h-8 text-sky-300" />;
      case 'nature':
        return <Trees className="w-8 h-8 text-emerald-300" />;
      default:
        return <Compass className="w-8 h-8 text-sky-300" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Toast Notification */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Itinerary link copied to clipboard!</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
        <button
          onClick={onModifyPlan}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Edit Preferences</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={() => onToggleSave(itinerary)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isSaved
                ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-xs'
                : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-sky-700 text-sky-700' : ''}`} />
            <span>{isSaved ? 'Saved to Outings' : 'Save Itinerary'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Print/Export */}
          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 transition-colors cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Honest Budget / Unverified Cost Disclaimer Notice */}
      {itinerary.hasUnverifiedCosts && (
        <div className="mb-8 p-4.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-950 text-sm">
              Good to know: entry fees
            </div>
            <p className="leading-relaxed text-amber-900">
              {itinerary.unverifiedCostNote ||
                "Some places on this route don't have published entry tickets. We've included fuel, transit, and food estimates, but keep a little cash handy for local tickets or parking."}
            </p>
          </div>
        </div>
      )}

      {/* Itinerary Header Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-700 uppercase mb-2">
          <span>{itinerary.startingLocation} Departure</span>
          <span aria-hidden="true">·</span>
          <span>{itinerary.totalDurationHours} Hours Total</span>
          <span aria-hidden="true">·</span>
          <span>{itinerary.stops.length} Curated Stops</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          {itinerary.title}
        </h1>

        <p className="mt-3 text-base text-neutral-600 leading-relaxed max-w-3xl">
          {itinerary.summary}
        </p>

        {/* Key Metrics Banner */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-xs">
            <span className="block text-[11px] font-medium text-neutral-400">
              {itinerary.hasUnverifiedCosts ? 'Estimated Transit & Food' : 'Estimated Cost'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-neutral-900 tabular-nums">
                ₹{itinerary.totalEstimatedCostPerPerson}
              </span>
              <span className="text-xs text-neutral-500">/ person</span>
            </div>
            {itinerary.hasUnverifiedCosts && (
              <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                + local gate entry
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-xs">
            <span className="block text-[11px] font-medium text-neutral-400">Total Distance</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-neutral-900 tabular-nums">
                {itinerary.totalDistanceKm} km
              </span>
              <span className="text-xs text-neutral-500">round-trip</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-xs">
            <span className="block text-[11px] font-medium text-neutral-400">Group Size</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-neutral-900">
                {itinerary.groupSize} {itinerary.groupSize === 1 ? 'Solo' : 'People'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-xs">
            <span className="block text-[11px] font-medium text-neutral-400">Travel Mode</span>
            <div className="text-xs font-semibold text-neutral-800 mt-1 truncate">
              {getTransportLabel(itinerary.transportMode).split('(')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Map-Style Route Section (Interactive Visual Route Map) */}
      <section className="mb-12 bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-sky-600" />
              <span>Route Overview</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Stops are sequenced so you spend more time enjoying places and less time stuck in traffic.
            </p>
          </div>
          <div className="text-xs font-semibold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 self-start sm:self-auto">
            {itinerary.totalDistanceKm} km · {itinerary.stops.length} Stops
          </div>
        </div>

        {/* Visual Route Path Map Canvas */}
        <div className="py-6 overflow-x-auto">
          <div className="min-w-[620px] flex items-center justify-between relative px-4">
            {/* Background Route Line */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-amber-500 -translate-y-1/2 rounded-full z-0 opacity-40" />

            {/* Starting Point Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shadow-md">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-neutral-900 mt-2">Start</span>
              <span className="text-[11px] text-neutral-500 max-w-[100px] text-center truncate">
                {itinerary.startingLocation}
              </span>
            </div>

            {/* Stop Nodes */}
            {itinerary.stops.map((stop, idx) => (
              <React.Fragment key={stop.stopNumber}>
                {/* Transit Segment Indicator */}
                <div className="flex-1 flex flex-col items-center justify-center px-2 z-10">
                  <span className="text-[10px] font-mono font-medium text-neutral-500 bg-white/95 px-2 py-0.5 rounded-full border border-neutral-200 tabular-nums shadow-2xs">
                    {stop.travelTimeToNextMinutes ? `${stop.travelTimeToNextMinutes}m drive` : 'Destination'}
                  </span>
                </div>

                {/* Stop Marker Node */}
                <div
                  onClick={() => setActiveStopIndex(idx)}
                  className={`relative z-10 flex flex-col items-center cursor-pointer transition-transform ${
                    activeStopIndex === idx ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                      activeStopIndex === idx
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                        : 'bg-white border-2 border-sky-600 text-sky-800'
                    }`}
                  >
                    0{stop.stopNumber}
                  </div>
                  <span className="text-xs font-bold text-neutral-900 mt-2 max-w-[110px] text-center truncate">
                    {stop.destination.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 tabular-nums">
                    {stop.startTime}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Chronological Stop Cards Timeline */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">
            Your day at a glance
          </h2>
          <span className="text-xs text-neutral-500">
            {itinerary.stops.length} stops planned
          </span>
        </div>

        <div className="space-y-6">
          {itinerary.stops.map((stop) => (
            <div
              key={stop.stopNumber}
              className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs transition-all hover:border-neutral-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Stop Photograph or Elegant Category Banner (Desktop 5 cols, Mobile full) */}
                <div className="md:col-span-5 relative aspect-[16/10] md:aspect-auto h-52 md:h-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                  {stop.destination.imageUrl ? (
                    <img
                      src={stop.destination.imageUrl}
                      alt={stop.destination.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-6 flex flex-col justify-between relative">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                          {renderCategoryIcon(stop.destination.category)}
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300 bg-white/10 px-2 py-0.5 rounded-md">
                          {stop.destination.subcategory || stop.destination.category}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-sky-200 font-medium">{stop.destination.area || 'Pune Region'}</div>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-neutral-900/85 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md z-10">
                    Stop 0{stop.stopNumber}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md z-10">
                    {stop.destination.area || 'Pune Region'}
                  </div>
                </div>

                {/* Stop Content & Details (Desktop 7 cols) */}
                <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    {/* Time & Duration Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 mb-2">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>
                          {stop.startTime} — {stop.endTime}
                        </span>
                        <span className="text-neutral-400 font-normal">
                          ({stop.durationMinutes} mins)
                        </span>
                      </div>
                      <span className="font-semibold text-emerald-800 tabular-nums">
                        {stop.estimatedCost !== null
                          ? `Est. ₹${stop.estimatedCost} / person`
                          : 'Entry fee not listed (check at gate)'}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-neutral-900">
                      {stop.destination.name}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {stop.destination.description ||
                        stop.destination.tagline ||
                        `Curated destination located in ${stop.destination.area || 'Pune'}.`}
                    </p>

                    {/* Why GoAround Selected This */}
                    <div className="mt-4 p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs">
                      <div className="font-semibold text-sky-900 flex items-center gap-1.5 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>Why you&apos;ll like this spot:</span>
                      </div>
                      <p className="text-sky-800">{stop.reasonForPick}</p>
                    </div>

                    {/* Insider local tip */}
                    <div className="mt-2.5 p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                      <div className="font-semibold text-amber-900 flex items-center gap-1.5 mb-0.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Helpful tip:</span>
                      </div>
                      <p className="text-amber-800">{stop.insiderTip}</p>
                    </div>

                    {/* Get Directions link */}
                    <div className="mt-3">
                      <a
                        href={buildGoogleMapsDirectionsUrl(stop.destination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Get directions to ${stop.destination.name} on Google Maps`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Google Maps ↗
                      </a>
                    </div>
                  </div>

                  {/* Transit to Next Stop (if not last) */}
                  {stop.travelTimeToNextMinutes && (
                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <Bike className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Next stop: ~{stop.travelTimeToNextMinutes} mins</span>
                        <span aria-hidden="true">·</span>
                        <span>{stop.distanceToNextKm} km</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-medium truncate max-w-[200px]">
                        {stop.transitNotesToNext}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Budget Breakdown & Practical Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Budget Breakdown */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs">
          <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-sky-600" />
            <span>What your day could cost</span>
          </h3>

          <div className="space-y-3.5">
            {itinerary.budgetBreakdown.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700">{item.name}</span>
                  <span className="text-neutral-900 font-bold tabular-nums">
                    {item.isUnverified ? (
                      <span className="text-amber-700 font-semibold">Unverified (pay at gate)</span>
                    ) : (
                      `₹${item.amount} (${item.percent}%)`
                    )}
                  </span>
                </div>
                {!item.isUnverified && (
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, item.percent)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-baseline">
            <span className="text-xs font-semibold text-neutral-600">
              {itinerary.hasUnverifiedCosts ? 'Base route estimate (excl. gate):' : 'Total estimated cost:'}
            </span>
            <span className="text-xl font-bold text-neutral-900 tabular-nums">
              ₹{itinerary.totalEstimatedCostPerPerson}
              <span className="text-xs font-normal text-neutral-500"> / person</span>
            </span>
          </div>
        </div>

        {/* Practical Notes & Safety */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs">
          <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600" />
            <span>Know before you go</span>
          </h3>

          <ul className="space-y-3">
            {itinerary.practicalNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-600 leading-relaxed">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
            <li className="flex items-start gap-2.5 text-xs text-neutral-600 leading-relaxed">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Fuel/fare calibrated for {itinerary.groupSize} traveler{itinerary.groupSize > 1 ? 's' : ''}.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Footer Callout */}
      <div className="p-6 bg-neutral-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display text-lg font-bold">Ready to take this outing?</h4>
          <p className="text-xs text-neutral-300 mt-0.5">
            Save it to your device or send the share link to your weekend group chat.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onToggleSave(itinerary)}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            {isSaved ? 'Saved in Outings' : 'Save Itinerary'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};
