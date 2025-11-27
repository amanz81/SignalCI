"use client";

import React, { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from './TourProvider';
import { usePathname } from 'next/navigation';
import { homeTourSteps, dashboardTourSteps, builderTourSteps, pipelineDetailTourSteps } from './tourSteps';

export const TourButton: React.FC = () => {
  const { startTour } = useTour();
  const pathname = usePathname();

  // Auto-start tour for first-time users (optional - can be enabled)
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('tour_completed');
    const hasSeenWelcome = localStorage.getItem('tour_welcome_shown');
    
    // Only auto-start on home page for first-time users
    if (!hasCompletedTour && !hasSeenWelcome && pathname === '/') {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        localStorage.setItem('tour_welcome_shown', 'true');
        // Uncomment the line below to enable auto-start
        // startTour(homeTourSteps);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, startTour]);

  const handleStartTour = () => {
    let steps;
    
    if (pathname === '/') {
      steps = homeTourSteps;
    } else if (pathname === '/dashboard') {
      steps = dashboardTourSteps;
    } else if (pathname === '/builder') {
      steps = builderTourSteps;
    } else if (pathname?.startsWith('/pipelines/')) {
      steps = pipelineDetailTourSteps;
    } else {
      // Default to home tour
      steps = homeTourSteps;
    }

    startTour(steps);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartTour}
      className="fixed bottom-6 right-6 z-50 shadow-lg flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
      title="Start guided tour"
    >
      <HelpCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Tour</span>
    </Button>
  );
};

