import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TemplatesSection } from './components/TemplatesSection';
import { PopularDestinationsGrid } from './components/PopularDestinationsGrid';
import { TripPlannerForm } from './components/TripPlannerForm';
import { TripResultView } from './components/TripResultView';
import { SavedTripsDrawer } from './components/SavedTripsDrawer';
import { Footer } from './components/Footer';
import { PlanInput, Itinerary, TripTemplate, Destination } from './types';
import { generateItinerary } from './services/plannerEngine';
import { tripStorageService, fetchPublishedDestinations } from './services/supabase';
import { CURATED_TEMPLATES } from './data/puneDestinations';
import { Database, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'planner' | 'templates' | 'result'>('home');
  const [plannerInput, setPlannerInput] = useState<Partial<PlanInput>>({
    startingLocation: 'fc_road',
    timeAvailableHours: 8,
    budgetPerPerson: 800,
    groupSize: 2,
    transportMode: 'two_wheeler',
    interests: ['nature', 'heritage', 'scenic_view'],
    thingsToAvoid: ['heavy_traffic'],
  });

  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Real destinations state from Supabase
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);

  // Load real published destinations from Supabase
  const loadDestinations = useCallback(async () => {
    setIsLoadingDestinations(true);
    setDestinationsError(null);

    const result = await fetchPublishedDestinations();

    if (result.error) {
      setDestinationsError(result.error);
      setDestinations([]); // Do not silently fall back to mock data
      setIsLoadingDestinations(false);
      return;
    }

    setDestinations(result.data);
    setIsLoadingDestinations(false);

    // Generate initial trip from real destinations once loaded
    if (result.data.length > 0) {
      const initialTrip = generateItinerary(
        {
          startingLocation: 'fc_road',
          timeAvailableHours: 8,
          budgetPerPerson: 800,
          groupSize: 2,
          transportMode: 'two_wheeler',
          interests: ['nature', 'heritage', 'scenic_view'],
          thingsToAvoid: ['heavy_traffic'],
        },
        result.data
      );
      setCurrentItinerary(initialTrip);
    }
  }, []);

  // Initialize saved trips from local store & load Supabase data on mount
  useEffect(() => {
    const loaded = tripStorageService.getSavedItineraries();
    setSavedTrips(loaded);
    loadDestinations();
  }, [loadDestinations]);

  const handlePlanSubmit = (input: PlanInput) => {
    if (destinations.length === 0 && destinationsError) {
      alert(`Cannot plan trip with real data: ${destinationsError}`);
      return;
    }

    setIsGenerating(true);
    setPlannerInput(input);

    setTimeout(() => {
      const generated = generateItinerary(input, destinations);
      setCurrentItinerary(generated);
      setIsGenerating(false);
      setCurrentTab('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleSelectTemplate = (template: TripTemplate) => {
    setPlannerInput(template.defaults);
    const generated = generateItinerary(template.defaults, destinations);
    setCurrentItinerary(generated);
    setCurrentTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTemplateById = (templateId: string) => {
    const tmpl = CURATED_TEMPLATES.find((t) => t.id === templateId) || CURATED_TEMPLATES[0];
    handleSelectTemplate(tmpl);
  };

  const handlePickDestination = (dest: Destination) => {
    setPlannerInput((prev) => ({
      ...prev,
      interests: Array.from(new Set([...(prev.interests || []), dest.category])),
    }));
    setCurrentTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = async (itinerary: Itinerary) => {
    const alreadySaved = tripStorageService.isSaved(itinerary.id);
    if (alreadySaved) {
      tripStorageService.removeItinerary(itinerary.id);
      setSavedTrips((prev) => prev.filter((t) => t.id !== itinerary.id));
    } else {
      await tripStorageService.saveItinerary(itinerary);
      setSavedTrips((prev) => [itinerary, ...prev.filter((t) => t.id !== itinerary.id)]);
    }
  };

  const handleDeleteSavedTrip = (id: string) => {
    tripStorageService.removeItinerary(id);
    setSavedTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectSavedTrip = (trip: Itinerary) => {
    setCurrentItinerary(trip);
    setCurrentTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentItinerarySaved = currentItinerary
    ? savedTrips.some((t) => t.id === currentItinerary.id)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/70 text-neutral-900">
      {/* Primary Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedTrips.length}
        onOpenSaved={() => setSavedDrawerOpen(true)}
      />

      {/* Supabase Connection Status Banner */}
      {destinationsError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="font-semibold">Supabase Backend Status:</strong> {destinationsError}
              </span>
            </div>
            <button
              onClick={loadDestinations}
              disabled={isLoadingDestinations}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDestinations ? 'animate-spin' : ''}`} />
              <span>Retry Fetching</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <div>
            <HeroSection
              onQuickPlan={handlePlanSubmit}
              onNavigateToPlanner={() => {
                setCurrentTab('planner');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectTemplate={handleSelectTemplateById}
            />

            {/* Curated Templates Section */}
            <TemplatesSection onSelectTemplate={handleSelectTemplate} />

            {/* Real Published Destinations Showcase / Error State */}
            {isLoadingDestinations ? (
              <section className="py-16 text-center bg-white border-t border-neutral-100">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Loading published Pune destinations from Supabase...</span>
                </div>
              </section>
            ) : destinationsError ? (
              <section className="py-16 bg-white border-t border-neutral-200">
                <div className="max-w-xl mx-auto px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral-900">
                    Real Destination Catalog Offline
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {destinationsError}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    GoAround never silently replaces real database records with fake mock data.
                    Please execute the SQL migration and import script, then retry.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={loadDestinations}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Connection</span>
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <PopularDestinationsGrid
                destinations={destinations}
                onPickDestination={handlePickDestination}
              />
            )}
          </div>
        )}

        {currentTab === 'planner' && (
          <TripPlannerForm
            initialValues={plannerInput}
            onSubmit={handlePlanSubmit}
            isGenerating={isGenerating}
          />
        )}

        {currentTab === 'templates' && (
          <div className="py-8">
            <TemplatesSection onSelectTemplate={handleSelectTemplate} />
          </div>
        )}

        {currentTab === 'result' && currentItinerary && (
          <TripResultView
            itinerary={currentItinerary}
            isSaved={isCurrentItinerarySaved}
            onToggleSave={handleToggleSave}
            onModifyPlan={() => {
              setCurrentTab('planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Slide-over Drawer for Saved Outings */}
      <SavedTripsDrawer
        isOpen={savedDrawerOpen}
        onClose={() => setSavedDrawerOpen(false)}
        savedTrips={savedTrips}
        onSelectTrip={handleSelectSavedTrip}
        onDeleteTrip={handleDeleteSavedTrip}
      />

      {/* Quiet Trustworthy Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
