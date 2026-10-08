import React from 'react';
import { ArrowRight, Clock, IndianRupee, Star, Compass, Bookmark } from 'lucide-react';
import { CURATED_TEMPLATES } from '../data/puneDestinations';
import { TripTemplate } from '../types';

interface TemplatesSectionProps {
  onSelectTemplate: (template: TripTemplate) => void;
  onBookmarkTemplate?: (template: TripTemplate) => void;
}

export const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  onSelectTemplate,
}) => {
  return (
    <section className="py-14 sm:py-20 bg-neutral-50/60 border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-sky-700 uppercase mb-2">
              Ready-To-Go Outings
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 text-balance">
              Proven routes tested by Pune locals
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl">
              Calibrated itineraries for your weekend. Zero guessing parking rules, food stalls, or road quality.
            </p>
          </div>
        </div>

        {/* Templates Grid (Matching the 4 cards in the user reference image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CURATED_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="group bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Real High-Resolution Destination Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={tmpl.imageUrl}
                    alt={tmpl.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle contrast gradient for card legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                  {/* Clean unboxed category label in corner */}
                  <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                    {tmpl.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                    <span>{tmpl.subtitle}</span>
                    <span className="font-semibold text-emerald-700">★ 4.9 (Local pick)</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-neutral-900 group-hover:text-sky-700 transition-colors">
                    {tmpl.name}
                  </h3>

                  <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                    {tmpl.tagline}
                  </p>

                  {/* Highlights Unboxed List */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                    {tmpl.highlights.slice(0, 3).map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                        <span className="truncate">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Metadata & Action */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-neutral-400">Est. Total</span>
                    <span className="font-bold text-base text-neutral-900 tabular-nums">
                      ₹{tmpl.estimatedCost}
                    </span>
                    <span className="text-[11px] text-neutral-500"> / person</span>
                  </div>

                  <button
                    onClick={() => onSelectTemplate(tmpl)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 group-hover:translate-x-0.5 transition-all p-2 rounded-lg hover:bg-sky-50 cursor-pointer"
                  >
                    <span>Load Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
