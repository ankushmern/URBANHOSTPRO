import React from 'react';

interface CookMantraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  onClick?: () => void;
}

export const CookMantraLogo: React.FC<CookMantraLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'auto',
  onClick,
}) => {
  // Dimensions based on size
  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-5xl',
  };

  const getCookTextColor = () => {
    if (variant === 'light') return 'text-white';
    if (variant === 'dark') return 'text-gray-950';
    return 'text-gray-950 dark:text-white';
  };

  const getMantraTextColor = () => {
    if (variant === 'light') return 'text-amber-400';
    if (variant === 'dark') return 'text-amber-600';
    return 'text-amber-500 dark:text-amber-400';
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* CookMantra Emblem / Icon matching the uploaded logo image */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-2xl bg-[#18181c] p-1 shadow-xl border border-amber-500/30 overflow-hidden group`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        >
          {/* Dark Charcoal Canvas */}
          <rect width="200" height="200" rx="36" fill="#18181C" />

          {/* Outer & Inner Golden Rings */}
          <circle cx="100" cy="112" r="64" stroke="url(#goldGradMain)" strokeWidth="8" />
          <circle cx="100" cy="112" r="54" stroke="url(#goldGradMain)" strokeWidth="3" opacity="0.85" />

          {/* Sparkles / Stars around the emblem */}
          <path d="M25 70 L28 78 L36 81 L28 84 L25 92 L22 84 L14 81 L22 78 Z" fill="#FBBF24" />
          <path d="M175 70 L178 78 L186 81 L178 84 L175 92 L172 84 L164 81 L172 78 Z" fill="#FBBF24" />
          <path d="M154 146 L156 150 L160 152 L156 154 L154 158 L152 154 L148 152 L152 150 Z" fill="#FBBF24" opacity="0.9" />
          <path d="M46 146 L48 150 L52 152 L48 154 L46 158 L44 154 L40 152 L44 150 Z" fill="#FBBF24" opacity="0.9" />
          <circle cx="124" cy="68" r="2.5" fill="#FBBF24" />
          <circle cx="76" cy="68" r="2.5" fill="#FBBF24" />

          {/* Cutlery - Spoon (Left) */}
          <g fill="#FFFFFF">
            <ellipse cx="72" cy="115" rx="8.5" ry="13" />
            <rect x="70" y="126" width="4" height="28" rx="2" />
          </g>

          {/* Cutlery - Knife (Center) */}
          <g fill="#FFFFFF">
            <path d="M100 98 C106 98 108 108 108 122 L108 128 L98 128 L98 101 C98 99 99 98 100 98 Z" />
            <rect x="98" y="126" width="4" height="28" rx="2" />
          </g>

          {/* Cutlery - Fork (Right) */}
          <g fill="#FFFFFF">
            <path d="M120 98 L120 118 C120 124 128 124 128 118 L128 98 M124 98 L124 122" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
            <rect x="122" y="121" width="4" height="33" rx="2" />
          </g>

          {/* Chef Hat (Top) */}
          <g transform="translate(42, 22)">
            {/* White Hat Puffs */}
            <path
              d="M18 42 C8 36 6 18 22 15 C26 4 50 2 58 12 C66 2 88 6 90 18 C102 16 104 36 92 42 Z"
              fill="#FFFFFF"
              stroke="url(#goldGradMain)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Hat Gold Band */}
            <path
              d="M20 40 L90 40 L85 51 L25 51 Z"
              fill="url(#goldGradMain)"
            />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="goldGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text Branding & Dual Golden Swoosh */}
      {showText && (
        <div className="flex flex-col relative leading-none group-hover:opacity-95 transition-opacity">
          <div className={`font-black tracking-tight ${textSizes[size]} flex items-center`}>
            <span className={`${getCookTextColor()} transition-colors`}>Cook</span>
            <span className={`${getMantraTextColor()} transition-colors`}>Mantra</span>
          </div>

          {/* Dual Golden Wave Swoosh Underline with Sparkle */}
          <div className="relative w-full h-3.5 mt-0.5">
            <svg viewBox="0 0 130 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                d="M2 4 Q 45 14, 115 6"
                stroke="url(#swooshGoldMain)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M12 9 Q 55 18, 122 9"
                stroke="url(#swooshGoldMain)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
              <path d="M122 8 L124 3 L126 8 L130 10 L126 12 L124 17 L122 12 L118 10 Z" fill="#FBBF24" />
              <defs>
                <linearGradient id="swooshGoldMain" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="80%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

