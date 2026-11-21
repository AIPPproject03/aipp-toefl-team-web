import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export function useShouldReduceMotion(): boolean {
  const { state } = useApp();
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setOsReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return state.profile.reducedMotion || osReduced;
}

interface PageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  disabled?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  routeKey,
  disabled = false,
}) => {
  const reduce = useShouldReduceMotion();

  if (reduce || disabled) {
    return <div key={routeKey}>{children}</div>;
  }

  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

interface ScoreRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  value,
  max,
  size = 112,
  strokeWidth = 8,
  trackColor = 'rgba(255,255,255,0.12)',
  progressColor = '#22D3EE',
  className = '',
  children,
}) => {
  const reduce = useShouldReduceMotion();
  const clamped = Math.max(0, Math.min(max, value));
  const pct = max > 0 ? clamped / max : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - pct);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduce ? targetOffset : circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.08 }
          }
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
};

interface AnimatedProgressBarProps {
  percent: number;
  heightClass?: string;
  trackClass?: string;
  fillClass?: string;
  delay?: number;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  percent,
  heightClass = 'h-1.5',
  trackClass = 'bg-slate-100 dark:bg-slate-800',
  fillClass = 'bg-[#1D4ED8] dark:bg-cyan-400',
  delay = 0.04,
}) => {
  const reduce = useShouldReduceMotion();
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={`w-full rounded-full overflow-hidden ${heightClass} ${trackClass}`}>
      <motion.div
        className={`h-full rounded-full origin-left ${fillClass}`}
        initial={{ width: reduce ? `${clamped}%` : '0%' }}
        animate={{ width: `${clamped}%` }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }
        }
      />
    </div>
  );
};

interface CountUpValueProps {
  value: number;
  decimals?: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CountUpValue: React.FC<CountUpValueProps> = ({
  value,
  decimals = 1,
  durationMs = 680,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const reduce = useShouldReduceMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    let rafId = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs, reduce]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  unit?: string;
  decimals?: number;
}

export const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({
  active,
  payload,
  label,
  unit = '',
  decimals,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl bg-[#0B1733] dark:bg-[#060D1F] text-white border border-slate-700/80 shadow-xl px-3.5 py-2.5 text-xs min-w-[132px]">
      {label && (
        <div className="font-semibold text-slate-300 pb-1.5 mb-1.5 border-b border-white/10">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, idx) => {
          const numVal = typeof entry.value === 'number' ? entry.value : Number(entry.value);
          const formatted =
            !Number.isNaN(numVal) && decimals !== undefined
              ? numVal.toFixed(decimals)
              : entry.value;
          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || '#22D3EE' }}
                />
                <span>{entry.name}</span>
              </span>
              <span className="font-semibold text-white tabular-nums">
                {formatted}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
