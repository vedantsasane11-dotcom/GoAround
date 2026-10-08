import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  IndianRupee,
  Bike,
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Users,
  Sparkles,
} from 'lucide-react';
import { PlanInput, TransportMode, TripDuration } from '../types';
import { PUNE_STARTING_HUBS, imgHeroSahyadri, imgSinhagad } from '../data/puneDestinations';

interface HeroSectionProps {
  onQuickPlan: (input: PlanInput) => void;
  onNavigateToPlanner: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onQuickPlan,
  onNavigateToPlanner,
  onSelectTemplate,
}) => {
  const [startingLoc, setStartingLoc] = useState<string>('fc_road');
  const [timeAvailable, setTimeAvailable] = useState<TripDuration>(8);
  const [budget, setBudget] = useState<number>(800);
  const [transport, setTransport] = useState<TransportMode>('two_wheeler');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickPlan({
      startingLocation: startingLoc,
      timeAvailableHours: timeAvailable,
      budgetPerPerson: budget,
      groupSize: 2,
      transportMode: transport,
      interests: ['nature', 'heritage', 'food_cafe'],
      thingsToAvoid: ['heavy_traffic'],
    });
  };

  return (
    <div className="relative overflow-hidden bg-neutral-900 text-white">
      {/* Hero Visual Container */}
      <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Real High-Resolution Landscape Photo Backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src={imgHeroSahyadri}
            alt="Sahyadri mountain range valley near Pune at golden hour"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.05]"
          />
          {/* Subtle natural vignetting & contrast gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/40 to-neutral-900/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-900/40 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Subtle kicker without pill enclosure */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-300 uppercase">
                <span>Pune & Western Ghats</span>
                <span aria-hidden="true">·</span>
                <span>Real Outing Planner</span>
                <span aria-hidden="true">·</span>
                <span>Verified Routes</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                Plan the trip you can{' '}
                <span className="italic font-normal text-sky-200">actually</span> take.
              </h1>

              <p className="text-base sm:text-lg text-neutral-200 font-normal leading-relaxed max-w-xl">
                Tired of over-ambitious weekend plans that dissolve in highway jams? Tripweave weaves realistic local outings calibrated to your starting point, exact hours, and student budget.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onNavigateToPlanner}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-sky-900/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-100" />
                  <span>Plan My Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectTemplate('one_day_under_1000')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-medium text-sm border border-white/20 transition-all cursor-pointer"
                >
                  <span>Explore Outings Under ₹1000</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Realistic Pune Transit Times</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-amber-300" />
                  <span>Honest Cost Breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-300" />
                  <span>Built for Students & Young Pros</span>
                </div>
              </div>
            </div>

            {/* Right Column: Route Elevation / Sample Trail Preview (Inspired by Reference) */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl text-neutral-200 max-w-md ml-auto">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-neutral-300">
                      Popular Trail Preview
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-300">₹580 / person</span>
                </div>

                <div className="mt-4">
                  <h3 className="font-display text-xl font-bold text-white">
                    Sinhagad Fortress & Ghat Trail
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    FC Road → Khadakwasla → Sinhagad Ridge → Tanaji Samadhi
                  </p>
                </div>

                {/* Trail Elevation Graph Visual */}
                <div className="my-5 bg-neutral-950/70 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span>Elevation & Stops</span>
                    <span>1,312 m Altitude</span>
                  </div>
                  <div className="relative h-16 w-full flex items-end">
                    {/* SVG Trail Line */}
                    <svg
                      viewBox="0 0 300 60"
                      className="w-full h-full stroke-sky-400 fill-none stroke-[2.5]"
                    >
                      <path
                        d="M 10 50 Q 80 45, 120 30 T 200 18 T 290 8"
                        strokeLinecap="round"
                      />
                      <circle cx="10" cy="50" r="4" className="fill-sky-400" />
                      <circle cx="120" cy="30" r="4" className="fill-sky-300" />
                      <circle cx="200" cy="18" r="4" className="fill-amber-300" />
                      <circle cx="290" cy="8" r="5" className="fill-white" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mt-1 font-mono tabular-nums">
                    <span>0 km · FC Rd</span>
                    <span>14 km · Dam</span>
                    <span>32 km · Peak</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-300 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>8 Hours Outing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Two-Wheeler Friendly</span>
                  </div>
                  <button
                    onClick={() => onSelectTemplate('one_day_under_1000')}
                    className="text-sky-300 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    View Plan →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick-Planner Form Bar (Inspired by the Reference Image's prominent search bar) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 mb-8">
        <form
          onSubmit={handleQuickSubmit}
          className="bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-3 sm:p-4 text-neutral-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center"
        >
          {/* 1. Starting Location */}
          <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-neutral-200">
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-600" />
              <span>Starting From</span>
            </label>
            <select
              value={startingLoc}
              onChange={(e) => setStartingLoc(e.target.value)}
              className="w-full text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none cursor-pointer truncate"
            >
              {PUNE_STARTING_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Available Time */}
          <div className="px-3 py-2 border-b sm:border-b-0 lg:border-r border-neutral-200">
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-600" />
              <span>Time Available</span>
            </label>
            <select
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(Number(e.target.value) as TripDuration)}
              className="w-full text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={4}>4 Hours (Half Day)</option>
              <option value={8}>8 Hours (Full Day)</option>
              <option value={12}>12 Hours (Dawn to Dusk)</option>
              <option value={24}>24 Hours (Weekend Overnight)</option>
            </select>
          </div>

          {/* 3. Budget */}
          <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-neutral-200">
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-sky-600" />
              <span>Max Budget / Person</span>
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={400}>Under ₹400 (Chai & Snacks)</option>
              <option value={800}>Under ₹800 (Full Student Day)</option>
              <option value={1500}>Under ₹1,500 (Comfort Outing)</option>
              <option value={3000}>₹2,500+ (Weekend Getaway)</option>
            </select>
          </div>

          {/* 4. Transport Mode */}
          <div className="px-3 py-2">
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Bike className="w-3 h-3 text-sky-600" />
              <span>Transport</span>
            </label>
            <select
              value={transport}
              onChange={(e) => setTransport(e.target.value as TransportMode)}
              className="w-full text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="two_wheeler">Two-Wheeler (Bike/Scooter)</option>
              <option value="metro_bus">Pune Metro & PMPML Bus</option>
              <option value="cab_auto">Cab / Auto Rickshaw</option>
              <option value="own_car">Own Car / Carpool</option>
            </select>
          </div>

          {/* 5. Submit Action */}
          <div className="p-1">
            <button
              type="submit"
              className="w-full h-12 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Weave Outing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
