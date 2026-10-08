import React from 'react';
import { ALL_DESTINATIONS } from '../data/puneDestinations';
import { Destination } from '../types';
import { MapPin, Clock, IndianRupee, ArrowUpRight, Sparkles } from 'lucide-react';

interface PopularDestinationsGridProps {
  onPickDestination: (dest: Destination) => void;
}

export const PopularDestinationsGrid: React.FC<PopularDestinationsGridProps> = ({
  onPickDestination,
}) => {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-sky-700 uppercase mb-2">
              Curated Local Destinations
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Iconic Pune spots with verified intel
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl">
              From early morning fort ridges to evening tree-canopied cafes. Real costs, crowd levels, and timing tips.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ALL_DESTINATIONS.slice(0, 6).map((dest) => (
            <div
              key={dest.id}
              className="group bg-neutral-50/60 rounded-2xl border border-neutral-200/80 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-200">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-medium bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md">
                      {dest.bestTimeOfDay}
                    </span>
                    <span className="font-semibold text-amber-300 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md">
                      ₹{dest.costPerPerson} avg
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{dest.area}</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-neutral-900 group-hover:text-sky-700 transition-colors">
                    {dest.name}
                  </h3>

                  <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>

                  <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Visit: {dest.suggestedDurationMinutes} mins</span>
                    <span aria-hidden="true">·</span>
                    <span>Crowd: {dest.crowdLevel}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onPickDestination(dest)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 group-hover:text-amber-300" />
                  <span>Build Outing Around This</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
