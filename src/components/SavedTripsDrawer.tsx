import React from 'react';
import { X, Bookmark, Trash2, ArrowRight, Clock, IndianRupee, MapPin } from 'lucide-react';
import { Itinerary } from '../types';

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: Itinerary[];
  onSelectTrip: (trip: Itinerary) => void;
  onDeleteTrip: (id: string) => void;
}

export const SavedTripsDrawer: React.FC<SavedTripsDrawerProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
                <Bookmark className="w-4 h-4 fill-sky-700" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-neutral-900">
                  Saved Outings
                </h3>
                <span className="text-xs text-neutral-500">
                  {savedTrips.length} {savedTrips.length === 1 ? 'itinerary' : 'itineraries'} stored locally
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {savedTrips.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-3">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-neutral-800 text-sm">No saved outings yet</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  When you generate an itinerary you like, click &ldquo;Save Itinerary&rdquo; to access it anytime offline.
                </p>
              </div>
            ) : (
              savedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 rounded-2xl p-4 transition-all relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-bold text-sm text-neutral-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                        {trip.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrip(trip.id);
                        }}
                        className="text-neutral-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[120px]">{trip.startingLocation}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{trip.totalDurationHours}h</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-neutral-800 tabular-nums">
                        ₹{trip.totalEstimatedCostPerPerson}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2">
                      {trip.stops.map((s) => s.destination.name.split('&')[0]).join(' → ')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => {
                        onSelectTrip(trip);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                    >
                      <span>View Route</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
