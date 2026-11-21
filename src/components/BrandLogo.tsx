import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
  darkSurface?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false, darkSurface = false }) => {
  return (
    <div className="flex items-center gap-3 shrink-0 select-none">
      {/* Official AIPP TOEFL TEAM / AIPProject03 Emblem */}
      <div
        className={`${
          compact ? 'w-9 h-9 p-1' : 'w-10 h-10 p-1.5'
        } rounded-xl bg-[#0B1733] border ${
          darkSurface ? 'border-cyan-400/35' : 'border-slate-700/80 dark:border-cyan-400/35'
        } flex items-center justify-center shrink-0 shadow-xs`}
      >
        <img
          src="/assets/aistudio/aipp-logo_9a141648.png"
          alt="AIPP TOEFL TEAM — AIPProject03 Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
        />
      </div>

      {!compact && (
        <div className="min-w-0 leading-tight">
          <div
            className={`font-display font-bold text-[15px] tracking-tight whitespace-nowrap ${
              darkSurface ? 'text-white' : 'text-[#0B1733] dark:text-white'
            }`}
          >
            AIPP TOEFL TEAM
          </div>
          <div
            className={`text-[11px] font-medium tracking-wide whitespace-nowrap ${
              darkSurface ? 'text-cyan-300/90' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            AIPProject03 · iBT 2026
          </div>
        </div>
      )}
    </div>
  );
};
