import React, { useState, useEffect } from 'react';
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
import { tripStorageService } from './services/supabase';
import { CURATED_TEMPLATES } from './data/puneDestinations';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'planner' | 'templates' | 'result'>('home');
  const [plannerInput, setPlannerInput] = useState<Partial<PlanInput>>({
    startingLocation: 'fc_road',
    timeAvailableHours: 8,
    budgetPerPerson: 800,
    groupSize: 2,
    transportMode: 'two_wheeler',
    interests: ['nature', 'heritage', 'food_cafe'],
    thingsToAvoid: ['heavy_traffic'],
  });

  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize saved trips from local store
  useEffect(() => {
    const loaded = tripStorageService.getSavedItineraries();
    setSavedTrips(loaded);

    // Generate initial demo itinerary in the background so result is instantly ready if viewed
    const initialTrip = generateItinerary({
      startingLocation: 'fc_road',
      timeAvailableHours: 8,
      budgetPerPerson: 800,
      groupSize: 2,
      transportMode: 'two_wheeler',
      interests: ['nature', 'heritage', 'food_cafe'],
      thingsToAvoid: ['heavy_traffic'],
    });
    setCurrentItinerary(initialTrip);
  }, []);

  const handlePlanSubmit = (input: PlanInput) => {
    setIsGenerating(true);
    setPlannerInput(input);
    // Smooth responsive calculation
    setTimeout(() => {
      const generated = generateItinerary(input);
      setCurrentItinerary(generated);
      setIsGenerating(false);
      setCurrentTab('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleSelectTemplate = (template: TripTemplate) => {
    setPlannerInput(template.defaults);
    const generated = generateItinerary(template.defaults);
    setCurrentItinerary(generated);
    setCurrentTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTemplateById = (templateId: string) => {
    const tmpl = CURATED_TEMPLATES.find((t) => t.id === templateId) || CURATED_TEMPLATES[0];
    handleSelectTemplate(tmpl);
  };

  const handlePickDestination = (dest: Destination) => {
    // Pre-populate planner with this destination's category
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

            {/* Popular Local Destinations Showcase */}
            <PopularDestinationsGrid onPickDestination={handlePickDestination} />
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
