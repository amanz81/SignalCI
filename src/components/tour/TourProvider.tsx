"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tour } from './Tour';
import { TourStep } from './types';

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  endTour: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = useCallback((tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      } else {
        // Tour completed
        setIsActive(false);
        localStorage.setItem('tour_completed', 'true');
        return prev;
      }
    });
  }, [steps.length]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('tour_completed', 'true');
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('tour_completed', 'true');
  }, []);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        nextStep,
        previousStep,
        endTour,
        skipTour,
      }}
    >
      {children}
      {isActive && steps.length > 0 && (
        <Tour
          step={steps[currentStep]}
          isFirst={currentStep === 0}
          isLast={currentStep === steps.length - 1}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTour}
          onClose={endTour}
        />
      )}
    </TourContext.Provider>
  );
};

