"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourStep } from './types';

interface TourProps {
  step: TourStep;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const Tour: React.FC<TourProps> = ({
  step,
  isFirst,
  isLast,
  onNext,
  onPrevious,
  onSkip,
  onClose,
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find target element by data-tour attribute or selector
    const element = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement ||
                   document.querySelector(step.target) as HTMLElement;

    if (element) {
      setTargetElement(element);
      updatePositions(element);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the element
      element.style.zIndex = '1000';
      element.style.position = 'relative';
    }

    const handleResize = () => {
      if (element) {
        updatePositions(element);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (element) {
        element.style.zIndex = '';
        element.style.position = '';
      }
    };
  }, [step.target]);

  const updatePositions = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Set highlight position
    setHighlightPosition({
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    });

    // Calculate tooltip position based on step.position
    const position = step.position || 'bottom';
    const tooltipWidth = 320; // Approximate tooltip width
    const tooltipHeight = 200; // Approximate tooltip height
    const spacing = 16;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top + scrollY - tooltipHeight - spacing;
        left = rect.left + scrollX + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollY + spacing;
        left = rect.left + scrollX + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + scrollY + rect.height / 2 - tooltipHeight / 2;
        left = rect.left + scrollX - tooltipWidth - spacing;
        break;
      case 'right':
        top = rect.top + scrollY + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + scrollX + spacing;
        break;
      case 'center':
        top = window.innerHeight / 2 + scrollY - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 16) left = 16;
    if (left + tooltipWidth > viewportWidth - 16) {
      left = viewportWidth - tooltipWidth - 16;
    }
    if (top < 16) top = 16;
    if (top + tooltipHeight > viewportHeight + scrollY - 16) {
      top = viewportHeight + scrollY - tooltipHeight - 16;
    }

    setTooltipPosition({ top, left });
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Overlay - Full screen dark background */}
      <div
        className="fixed inset-0 bg-black/60 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Highlight ring - creates spotlight effect */}
      {targetElement && (
        <div
          className="fixed z-[9999] pointer-events-none border-4 border-blue-500 rounded-lg transition-all shadow-[0_0_0_0_rgba(59,130,246,0.5),0_0_20px_rgba(59,130,246,0.3)]"
          style={{
            top: `${highlightPosition.top - 4}px`,
            left: `${highlightPosition.left - 4}px`,
            width: `${highlightPosition.width + 8}px`,
            height: `${highlightPosition.height + 8}px`,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4)`,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 max-w-sm border border-gray-200 dark:border-gray-700"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {step.content}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {step.action && step.action !== 'none' && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              {step.action === 'click' && '💡 Click on the highlighted element to continue'}
              {step.action === 'wait' && '⏳ Please wait...'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
            <Button
              size="sm"
              onClick={isLast ? onClose : onNext}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

