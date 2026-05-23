'use client';

import { useRef } from 'react';

export interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatLabel?: (n: number) => string;
  ariaLabelMin?: string;
  ariaLabelMax?: string;
  className?: string;
}

export function DualRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatLabel,
  ariaLabelMin = 'Min',
  ariaLabelMax = 'Max',
  className = '',
}: DualRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pctL = max > min ? ((value[0] - min) / (max - min)) * 100 : 0;
  const pctR = max > min ? ((value[1] - min) / (max - min)) * 100 : 100;

  return (
    <div className={`pt-1 pb-2 ${className}`.trim()}>
      <div className="flex justify-between text-[12px] mb-1.5 text-[var(--text-dim)]">
        <span>{formatLabel ? formatLabel(value[0]) : value[0]}</span>
        <span>{formatLabel ? formatLabel(value[1]) : value[1]}</span>
      </div>
      <div ref={trackRef} className="relative h-5 flex items-center">
        <div className="absolute left-0 right-0 h-[5px] rounded-full bg-[var(--border)]" />
        <div
          className="absolute h-[5px] rounded-full bg-[var(--accent)]"
          style={{ left: `${pctL}%`, right: `${100 - pctR}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          aria-label={ariaLabelMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= value[1]) onChange([v, value[1]]);
          }}
          className="dual-range-thumb absolute w-full pointer-events-none appearance-none bg-transparent h-5 z-10"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          aria-label={ariaLabelMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= value[0]) onChange([value[0], v]);
          }}
          className="dual-range-thumb absolute w-full pointer-events-none appearance-none bg-transparent h-5 z-20"
        />
      </div>
      <style>{`
        .dual-range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--bg);
          cursor: pointer;
          pointer-events: all;
          box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 40%, transparent);
        }
        .dual-range-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--bg);
          cursor: pointer;
          pointer-events: all;
        }
      `}</style>
    </div>
  );
}
