import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  IndianRupee,
  Users,
  Bike,
  Train,
  Car,
  Compass,
  Sparkles,
  ShieldAlert,
  Heart,
  ChevronRight,
  Info,
} from 'lucide-react';
import { PlanInput, TransportMode, TripDuration } from '../types';
import { PUNE_STARTING_HUBS } from '../data/puneDestinations';

interface TripPlannerFormProps {
  initialValues?: Partial<PlanInput>;
  onSubmit: (values: PlanInput) => void;
  isGenerating?: boolean;
}

const INTEREST_OPTIONS = [
  { id: 'nature', label: 'Scenic Nature & Sahyadri Hills', desc: 'Waterfalls, forest trails, green overlooks' },
  { id: 'heritage', label: 'Historic Forts & Maratha Heritage', desc: 'Bastions, gateways, old city architecture' },
  { id: 'food_cafe', label: 'Café Hopping & Street Food', desc: 'Irani tea, bun maska, specialty roasteries' },
  { id: 'sunset_lakes', label: 'Peaceful Lakes & Sunset Points', desc: 'Pawna, Panshet, quiet reservoir shorelines' },
  { id: 'adventure', label: 'Adventure & Light Trekking', desc: 'Ridge trails, rocky climbs, viewpoint hikes' },
];

const AVOID_OPTIONS = [
  { id: 'heavy_traffic', label: 'Heavy Traffic Bottlenecks', desc: 'Avoid bypass choke points like Chandani Chowk at peak' },
  { id: 'strenuous_trekking', label: 'Strenuous Trekking Climbs', desc: 'Keep walks casual and vehicle-accessible' },
  { id: 'overpriced_dining', label: 'Overpriced Tourist Dining', desc: 'Stick to honest local dhabas and pocket-friendly spots' },
  { id: 'crowded_tourist_spots', label: 'Crowded Weekend Traps', desc: 'Favor quiet offbeat overlooks over packed tourist hubs' },
];

export const TripPlannerForm: React.FC<TripPlannerFormProps> = ({
  initialValues,
  onSubmit,
  isGenerating = false,
}) => {
  const [startingLocation, setStartingLocation] = useState<string>(
    initialValues?.startingLocation || 'fc_road'
  );
  const [timeAvailable, setTimeAvailable] = useState<TripDuration>(
    initialValues?.timeAvailableHours || 8
  );
  const [budgetPerPerson, setBudgetPerPerson] = useState<number>(
    initialValues?.budgetPerPerson || 800
  );
  const [groupSize, setGroupSize] = useState<number>(initialValues?.groupSize || 2);
  const [transportMode, setTransportMode] = useState<TransportMode>(
    initialValues?.transportMode || 'two_wheeler'
  );
  const [interests, setInterests] = useState<string[]>(
    initialValues?.interests || ['nature', 'heritage', 'food_cafe']
  );
  const [thingsToAvoid, setThingsToAvoid] = useState<string[]>(
    initialValues?.thingsToAvoid || ['heavy_traffic']
  );

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      if (interests.length > 1) {
        setInterests(interests.filter((item) => item !== id));
      }
    } else {
      setInterests([...interests, id]);
    }
  };

  const toggleAvoid = (id: string) => {
    if (thingsToAvoid.includes(id)) {
      setThingsToAvoid(thingsToAvoid.filter((item) => item !== id));
    } else {
      setThingsToAvoid([...thingsToAvoid, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startingLocation,
      timeAvailableHours: timeAvailable,
      budgetPerPerson,
      groupSize,
      transportMode,
      interests,
      thingsToAvoid,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Title & Introduction */}
      <div className="mb-10 text-center sm:text-left">
        <div className="text-xs font-semibold tracking-wider text-sky-700 uppercase mb-1.5">
          Step 1 · Tailor Your Outing
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          Where does your Saturday start?
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600">
          Enter realistic constraints. Tripweave constructs an optimized circuit without backtracking or surprise expenses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section 1: Logistics (Location, Time, Transport) */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-7">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>Starting Hub & Timing</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Starting Location */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">
                Starting Location in Pune
              </label>
              <select
                value={startingLocation}
                onChange={(e) => setStartingLocation(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white transition-all cursor-pointer"
              >
                {PUNE_STARTING_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name} ({hub.area})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-neutral-500">
                All transit minutes and fuel estimates calculate from this hub.
              </p>
            </div>

            {/* Time Available */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">
                Available Time Window
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 4, label: '4 Hours', sub: 'Quick Outing' },
                  { value: 8, label: '8 Hours', sub: 'Full Day' },
                  { value: 12, label: '12 Hours', sub: 'Dawn to Dusk' },
                  { value: 24, label: '24 Hours', sub: 'Weekend Retreat' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTimeAvailable(item.value as TripDuration)}
                    className={`py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                      timeAvailable === item.value
                        ? 'border-sky-600 bg-sky-50/70 text-sky-900 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/40'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-neutral-500">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          <div className="pt-4 border-t border-neutral-100">
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">
              Mode of Transportation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'two_wheeler',
                  label: 'Two-Wheeler',
                  sub: 'Bike / Scooter',
                  icon: Bike,
                },
                {
                  id: 'metro_bus',
                  label: 'Public Transit',
                  sub: 'Metro + Bus Pass',
                  icon: Train,
                },
                {
                  id: 'cab_auto',
                  label: 'Cab / Auto',
                  sub: 'Uber / Rickshaw',
                  icon: Car,
                },
                {
                  id: 'own_car',
                  label: 'Own Car',
                  sub: 'Self-drive / Carpool',
                  icon: Car,
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = transportMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTransportMode(m.id as TransportMode)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/80 text-sky-900 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-sky-600' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-neutral-500">{m.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Budget & Group Size */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-sky-600" />
            <span>Budget & Companions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            {/* Budget Per Person */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Budget Per Person
                </label>
                <span className="text-lg font-bold text-sky-800 tabular-nums">
                  ₹{budgetPerPerson}
                </span>
              </div>

              <input
                type="range"
                min={300}
                max={3000}
                step={50}
                value={budgetPerPerson}
                onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-neutral-500 mt-2 font-mono tabular-nums">
                <span>₹300 (Chai/Snacks)</span>
                <span>₹1,000 (Day Outing)</span>
                <span>₹3,000 (Weekend)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 mt-3">
                {[450, 800, 1500, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudgetPerPerson(preset)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      budgetPerPerson === preset
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">
                Group Size ({groupSize} {groupSize === 1 ? 'person' : 'people'})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { size: 1, label: 'Solo' },
                  { size: 2, label: 'Duo' },
                  { size: 4, label: 'Squad (3-5)' },
                  { size: 6, label: 'Gang (6+)' },
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setGroupSize(item.size)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      groupSize === item.size
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/40'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.size}</div>
                    <div className="text-[10px] text-neutral-500">{item.label}</div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Total group pool estimate: <strong className="text-neutral-800">₹{budgetPerPerson * groupSize}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Interests */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>What are you in the mood for?</span>
            </h2>
            <span className="text-xs text-neutral-500">Pick 1 or more</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {INTEREST_OPTIONS.map((opt) => {
              const isSelected = interests.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleInterest(opt.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/40 text-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-neutral-50/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 rounded text-sky-600 border-neutral-300 focus:ring-sky-500"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-900">{opt.label}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Things to Avoid */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Things to Avoid (Dealbreakers)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {AVOID_OPTIONS.map((opt) => {
              const isSelected = thingsToAvoid.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleAvoid(opt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-amber-500/80 bg-amber-50/40 text-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-neutral-50/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 rounded text-amber-600 border-neutral-300 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-900">{opt.label}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generation Action Callout */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Weaving Realistic Itinerary...</span>
              </>
            ) : (
              <>
                <Compass className="w-5 h-5 text-amber-300" />
                <span>Generate My Realistic Itinerary</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-neutral-500 mt-3">
            Real transit matrix applied · Calibrated for Pune weekend road conditions
          </p>
        </div>
      </form>
    </div>
  );
};
