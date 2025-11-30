/**
 * Circular progress gauge component for displaying scores.
 * @module components/ui/SpeedGauge
 */

import React from 'react';

/**
 * SpeedGauge component props.
 */
interface SpeedGaugeProps {
  /** Label text displayed below the gauge */
  label: string;
  /** Score value (0-100) to display */
  score: number;
  /** Size variant of the gauge */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom color for the progress stroke (HSL string) */
  color?: string;
}

/**
 * Circular progress gauge displaying a score value with color coding.
 * Score determines color: green (>=80), yellow (>=50), red (<50).
 * 
 * @param props.label - Display label below the gauge
 * @param props.score - Numeric value 0-100 to display
 * @param props.size - Gauge diameter variant: 'sm' | 'md' | 'lg'. Defaults to 'md'.
 * @param props.color - Optional override for stroke color (HSL string)
 * 
 * @example
 * <SpeedGauge label="Quality" score={85} size="md" />
 * 
 * @example
 * <SpeedGauge label="Security" score={45} size="lg" color="hsl(200, 70%, 50%)" />
 */
export const SpeedGauge: React.FC<SpeedGaugeProps> = ({ label, score, size = 'md', color }) => {
  const radius = size === 'lg' ? 40 : size === 'md' ? 24 : 16;
  const stroke = size === 'lg' ? 6 : size === 'md' ? 4 : 3;
  const normalizedScore = Math.min(100, Math.max(0, score || 0));
  const circumference = 2 * Math.PI * radius;
  const dashArray = `${(normalizedScore / 100) * circumference} ${circumference}`;
  
  let strokeColor = color;
  if (!strokeColor) {
    if (score >= 80) strokeColor = 'hsl(140, 70%, 50%)'; 
    else if (score >= 50) strokeColor = 'hsl(40, 90%, 50%)'; 
    else strokeColor = 'hsl(0, 80%, 60%)';
  }

  const textSize = size === 'lg' ? 'text-xl' : size === 'md' ? 'text-sm' : 'text-[10px]';

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="relative flex items-center justify-center">
        <svg 
          width={radius * 2 + stroke * 2} 
          height={radius * 2 + stroke * 2} 
          className="transform -rotate-90"
        >
          <circle 
            cx="50%" 
            cy="50%" 
            r={radius} 
            stroke="hsl(var(--surface-3))" 
            strokeWidth={stroke} 
            fill="transparent" 
          />
          <circle 
            cx="50%" 
            cy="50%" 
            r={radius} 
            stroke={strokeColor} 
            strokeWidth={stroke} 
            fill="transparent" 
            strokeDasharray={dashArray} 
            strokeLinecap="round" 
          />
        </svg>
        <div className={`absolute font-bold text-[hsl(var(--text-main))] ${textSize}`}>
          {score}
        </div>
      </div>
      <span className="text-[hsl(var(--text-dim))] text-xs font-semibold uppercase tracking-wider text-center">
        {label}
      </span>
    </div>
  );
};
