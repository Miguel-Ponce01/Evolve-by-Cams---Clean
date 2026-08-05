'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProgressBarVariant = 'dots' | 'capsules' | 'percent' | 'circle';
export type ProgressBarTheme = 'sunset' | 'teal' | 'gold' | 'silver';

export interface ProgressBarProps {
  steps: string[];
  currentStep: string | number; // Step name or index (0-based)
  variant?: ProgressBarVariant;
  theme?: ProgressBarTheme;
  className?: string;
  onStepClick?: (step: string, index: number) => void;
}

export default function ProgressBar({
  steps,
  currentStep,
  variant = 'dots',
  theme = 'sunset',
  className,
  onStepClick,
}: ProgressBarProps) {
  // Convert currentStep to a 0-based index
  const currentIndex = typeof currentStep === 'number' 
    ? currentStep 
    : steps.findIndex(s => s.toLowerCase() === String(currentStep).toLowerCase());
  
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const progressPercent = steps.length > 1 ? (activeIndex / (steps.length - 1)) * 100 : 100;

  // Theme style mapping
  const themeColors = {
    sunset: {
      activeBg: 'bg-gradient-to-r from-[#FF5E62] to-[#FF9966]',
      activeText: 'text-[#FF9966]',
      activeBorder: 'border-[#FF9966]',
      lineProgress: 'bg-gradient-to-r from-[#FF5E62] to-[#FF9966]',
      completedBg: 'bg-[#FF5E62]',
      completedBorder: 'border-[#FF5E62]',
      pulseColor: 'rgba(255, 94, 98, 0.4)',
      circleStroke: '#FF9966',
      badgeBg: 'bg-gradient-to-r from-[#FF5E62] to-[#FF9966] text-white',
    },
    teal: {
      activeBg: 'bg-[#00A896]',
      activeText: 'text-[#02C39A]',
      activeBorder: 'border-[#02C39A]',
      lineProgress: 'bg-[#00A896]',
      completedBg: 'bg-[#02C39A]',
      completedBorder: 'border-[#02C39A]',
      pulseColor: 'rgba(0, 168, 150, 0.4)',
      circleStroke: '#00A896',
      badgeBg: 'bg-[#00A896] text-white',
    },
    gold: {
      activeBg: 'bg-[#C9A961]',
      activeText: 'text-[#C9A961]',
      activeBorder: 'border-[#C9A961]',
      lineProgress: 'bg-[#C9A961]',
      completedBg: 'bg-[#C9A961]',
      completedBorder: 'border-[#C9A961]',
      pulseColor: 'rgba(201, 169, 97, 0.4)',
      circleStroke: '#C9A961',
      badgeBg: 'bg-[#C9A961] text-black',
    },
    silver: {
      activeBg: 'bg-zinc-800 dark:bg-[#D1D1D6]',
      activeText: 'text-zinc-200 dark:text-white',
      activeBorder: 'border-zinc-200 dark:border-white',
      lineProgress: 'bg-zinc-800 dark:bg-[#D1D1D6]',
      completedBg: 'bg-[#8E8E93]',
      completedBorder: 'border-[#8E8E93]',
      pulseColor: 'rgba(142, 142, 147, 0.4)',
      circleStroke: '#D1D1D6',
      badgeBg: 'bg-[#8E8E93] text-white',
    },
  }[theme];

  const handleStepClick = (step: string, idx: number) => {
    if (onStepClick && idx <= activeIndex + 1) {
      onStepClick(step, idx);
    }
  };

  /* ────────────────────────────────────────────────────────────────────────
     1. DOTS VARIANT (Style 3 in reference image)
     ──────────────────────────────────────────────────────────────────────── */
  if (variant === 'dots') {
    return (
      <div className={cn("w-full py-4", className)}>
        <div className="relative flex items-center justify-between w-full">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full z-0" />
          
          {/* Progress Indicator Line */}
          <div 
            className={cn("absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out", themeColors.lineProgress)}
            style={{ width: `${progressPercent}%` }}
          />

          {/* Steps */}
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            const isUpcoming = idx > activeIndex;

            return (
              <div 
                key={step} 
                className="relative z-10 flex flex-col items-center group"
                style={{ width: `${100 / steps.length}%` }}
              >
                {/* Node circle */}
                <button
                  type="button"
                  onClick={() => handleStepClick(step, idx)}
                  disabled={!onStepClick || idx > activeIndex + 1}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative outline-none select-none",
                    isCompleted && cn("text-white cursor-pointer", themeColors.completedBg, themeColors.completedBorder),
                    isActive && cn("bg-black border-2 cursor-pointer shadow-lg", themeColors.activeBorder),
                    isUpcoming && "bg-black border-zinc-700 text-zinc-500 cursor-not-allowed"
                  )}
                  style={{
                    boxShadow: isActive ? `0 0 12px ${themeColors.pulseColor}` : 'none'
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3px]" />
                  ) : isActive ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span 
                        className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75")}
                        style={{ backgroundColor: themeColors.circleStroke }}
                      />
                      <span 
                        className="relative inline-flex rounded-full h-2.5 w-2.5"
                        style={{ backgroundColor: themeColors.circleStroke }}
                      />
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  )}
                </button>

                {/* Step Label */}
                <span 
                  className={cn(
                    "mt-2.5 text-[11px] font-semibold tracking-wider uppercase font-mono transition-colors duration-200 select-none",
                    isActive ? "text-white" : isCompleted ? "text-zinc-350" : "text-zinc-600"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────
     2. CAPSULES VARIANT (Style 8 in reference image)
     ──────────────────────────────────────────────────────────────────────── */
  if (variant === 'capsules') {
    return (
      <div className={cn("w-full flex flex-row items-center gap-2 p-1.5 bg-zinc-900/60 dark:bg-zinc-950/80 rounded-full border border-zinc-800/85", className)}>
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isUpcoming = idx > activeIndex;

          return (
            <button
              key={step}
              type="button"
              onClick={() => handleStepClick(step, idx)}
              disabled={!onStepClick || idx > activeIndex + 1}
              className={cn(
                "flex-1 py-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 outline-none select-none",
                isActive && cn("text-white shadow-md", themeColors.activeBg),
                isCompleted && "bg-zinc-800/60 text-zinc-300 border border-zinc-700 hover:bg-zinc-800/90 cursor-pointer",
                isUpcoming && "bg-transparent text-zinc-650 border border-transparent cursor-not-allowed"
              )}
            >
              <span className="text-[10px] opacity-75">Step {idx + 1}</span>
              <span className="hidden sm:inline font-mono text-[10px] opacity-90">|</span>
              <span className="hidden sm:inline">{step}</span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────
     3. PERCENT VARIANT (Style 1/4 in reference image)
     ──────────────────────────────────────────────────────────────────────── */
  if (variant === 'percent') {
    const isFinished = activeIndex === steps.length - 1;
    const currentPercent = Math.round(((activeIndex + 1) / steps.length) * 100);

    return (
      <div className={cn("w-full bg-[#121212] border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center gap-4 transition-all hover:border-zinc-700", className)}>
        {/* Left Checkbox Badge */}
        <div className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center shrink-0 border border-zinc-800",
          isFinished ? themeColors.badgeBg : "bg-zinc-900 text-zinc-400"
        )}>
          {isFinished ? (
            <Check className="w-5 h-5 stroke-[3px]" />
          ) : (
            <span className="text-sm font-bold font-mono">{currentPercent}%</span>
          )}
        </div>

        {/* Right content */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-450 font-mono tracking-wide uppercase">Your Progress</span>
            <span className={cn("font-bold", themeColors.activeText)}>
              {isFinished ? "100% Completed" : `${currentPercent}% to Complete`}
            </span>
          </div>
          
          {/* Progress bar line */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500 ease-out", themeColors.lineProgress)}
              style={{ width: `${currentPercent}%` }}
            />
          </div>

          {/* Steps summary */}
          <div className="text-[10px] text-zinc-500 flex items-center justify-between font-mono">
            <span>Step {activeIndex + 1}: {steps[activeIndex]}</span>
            <span>{steps.length - activeIndex - 1} step(s) left</span>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────
     4. CIRCLE VARIANT (Style 5/6 in reference image)
     ──────────────────────────────────────────────────────────────────────── */
  // Circle SVG metrics
  const radius = 22;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = (activeIndex + 1) / steps.length;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className={cn("w-full bg-[#121212] border border-zinc-850 rounded-3xl p-5 flex items-center gap-5 shadow-xl transition-all hover:border-zinc-800", className)}>
      {/* Circle diagram on left */}
      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center select-none">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="#27272A"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke={themeColors.circleStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Centered label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-bold text-white font-mono leading-none">
          <span>{activeIndex + 1}</span>
          <span className="text-[8px] text-zinc-500 border-t border-zinc-800 mt-0.5 pt-0.5">of {steps.length}</span>
        </div>
      </div>

      {/* Details text on right */}
      <div className="flex-1">
        <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-mono">
          Step {activeIndex + 1}
        </div>
        <h4 className="text-sm font-bold text-white uppercase tracking-tight mt-0.5">
          {steps[activeIndex]}
        </h4>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
          {activeIndex === steps.length - 1 
            ? "Completed your booking registration successfully."
            : `Next step: ${steps[activeIndex + 1] || 'Finish'}`
          }
        </p>
      </div>
    </div>
  );
}
