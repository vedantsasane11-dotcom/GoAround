import React from 'react';
import { Compass, Bookmark, MapPin, Sparkles, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'planner' | 'templates' | 'result';
  onNavigate: (tab: 'home' | 'planner' | 'templates') => void;
  savedCount: number;
  onOpenSaved: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  savedCount,
  onOpenSaved,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-md"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm group-hover:bg-sky-600 transition-colors">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-neutral-900 group-hover:text-sky-700 transition-colors">
                Tripweave
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-neutral-900 relative py-1 ${
              currentTab === 'home'
                ? 'text-neutral-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-600'
                : ''
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className={`transition-colors hover:text-neutral-900 relative py-1 ${
              currentTab === 'planner'
                ? 'text-neutral-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-600'
                : ''
            }`}
          >
            Plan Trip
          </button>
          <button
            onClick={() => onNavigate('templates')}
            className={`transition-colors hover:text-neutral-900 relative py-1 ${
              currentTab === 'templates'
                ? 'text-neutral-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-600'
                : ''
            }`}
          >
            Curated Trails
          </button>
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 transition-colors hover:text-neutral-900 relative py-1"
          >
            <Bookmark className="w-4 h-4 text-neutral-500" />
            <span>Saved Outings</span>
            {savedCount > 0 && (
              <span className="text-xs bg-sky-100 text-sky-800 font-semibold px-2 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSaved}
            className="md:hidden relative p-2 text-neutral-700 hover:text-neutral-900 focus:outline-none"
            aria-label="View saved trips"
          >
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-600"></span>
            )}
          </button>

          <button
            onClick={() => onNavigate('planner')}
            className="hidden sm:inline-flex items-center gap-2 px-4.5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Plan My Trip</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 text-sm font-medium text-neutral-800 hover:text-sky-600 border-b border-neutral-100"
          >
            Explore
          </button>
          <button
            onClick={() => {
              onNavigate('planner');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 text-sm font-medium text-neutral-800 hover:text-sky-600 border-b border-neutral-100"
          >
            Plan Trip
          </button>
          <button
            onClick={() => {
              onNavigate('templates');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 text-sm font-medium text-neutral-800 hover:text-sky-600 border-b border-neutral-100"
          >
            Curated Trails
          </button>
          <button
            onClick={() => {
              onOpenSaved();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between py-2.5 text-sm font-medium text-neutral-800 hover:text-sky-600 border-b border-neutral-100"
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-neutral-500" />
              <span>Saved Outings</span>
            </span>
            <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
              {savedCount}
            </span>
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                onNavigate('planner');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 text-center text-sm font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 shadow-sm"
            >
              Start Trip Planner
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
