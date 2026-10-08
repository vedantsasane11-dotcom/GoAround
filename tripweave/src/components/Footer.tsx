import React from 'react';
import { Compass, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'planner' | 'templates') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Tripweave
              </span>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              The local outing planner for Pune students and young professionals. No impossible itineraries or generic recommendations—just honest times, verified spots, and real budgets.
            </p>
            <div className="text-xs text-neutral-500">
              Tested on two-wheelers, Pune Metro Line 1 & 2, and local state buses.
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Featured Outings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('planner')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Trip Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('templates')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Curated Circuits
                </button>
              </li>
              <li>
                <span className="text-neutral-500">Student Budget Guide (Under ₹1000)</span>
              </li>
            </ul>
          </div>

          {/* Pune Local Hubs */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Supported Starting Hubs
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li>FC Road & Deccan Gymkhana</li>
              <li>Kothrud (Chandani Chowk)</li>
              <li>Viman Nagar & Kalyani Nagar</li>
              <li>Hinjewadi IT Corridor</li>
              <li>Baner & Balewadi</li>
              <li>Pune Station & Camp</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Tripweave. Crafted for the love of Pune & Sahyadri.</p>
          <div className="flex items-center gap-4">
            <span>Realistic Times</span>
            <span aria-hidden="true">·</span>
            <span>Honest Budgets</span>
            <span aria-hidden="true">·</span>
            <span>Zero Fluff</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
