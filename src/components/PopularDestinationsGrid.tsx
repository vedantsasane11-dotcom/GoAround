import React from 'react';
import { Destination } from '../types';
import { MapPin, Clock, ArrowUpRight, Sparkles, Landmark, Mountain, Trees, Compass } from 'lucide-react';

interface PopularDestinationsGridProps {
  destinations: Destination[];
  onPickDestination: (dest: Destination) => void;
}

export const PopularDestinationsGrid: React.FC<PopularDestinationsGridProps> = ({
  destinations,
  onPickDestination,
}) => {
  const getCategoryIcon = (category: string) => {
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

  const displayList = destinations.slice(0, 9);

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-sky-700 uppercase mb-2">
              Popular Spots
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Places you&apos;ll love visiting around Pune
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl">
              Handpicked spots across Pune and the hills nearby — with honest notes on timing, crowd levels, and estimated costs.
            </p>
          </div>
          <div className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-lg">
            Showing {displayList.length} popular places
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((dest) => (
            <div
              key={dest.id}
              className="group bg-neutral-50/60 rounded-2xl border border-neutral-200/80 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Area: Real photo or elegant category showcase */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                  {dest.imageUrl ? (
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-6 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-sky-500/10 rounded-full blur-xl" />
                      <div className="flex justify-between items-start z-10">
                        <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                          {getCategoryIcon(dest.category)}
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300 bg-white/10 px-2 py-0.5 rounded-md">
                          {dest.subcategory || dest.category}
                        </span>
                      </div>
                      <div className="z-10">
                        <div className="text-xs text-sky-200 font-medium">{dest.area || 'Pune Region'}</div>
                        <div className="text-[11px] text-neutral-300">
                          {dest.subcategory || 'Scenic destination'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
                      {dest.bestTimeOfDay || (dest.category === 'scenic_view' ? 'Scenic Daylight' : 'Daytime')}
                    </span>
                    <span className="font-semibold text-amber-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
                      {dest.costPerPerson !== null && dest.costPerPerson !== undefined
                        ? `₹${dest.costPerPerson} avg`
                        : 'Entry fee: check locally'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{dest.area || 'Pune District'}</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-neutral-900 group-hover:text-sky-700 transition-colors">
                    {dest.name}
                  </h3>

                  <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                    {dest.tagline || dest.description || `Historic and scenic destination located in ${dest.area || 'the Pune region'}.`}
                  </p>

                  <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {dest.suggestedDurationMinutes
                        ? `Visit: ${dest.suggestedDurationMinutes} mins`
                        : 'Flexible duration'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">
                      {dest.crowdLevel ? `Crowd: ${dest.crowdLevel}` : 'Verified location'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onPickDestination(dest)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 group-hover:text-amber-300" />
                  <span>Plan a trip here</span>
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
