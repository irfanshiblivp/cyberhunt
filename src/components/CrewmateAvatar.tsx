import React from 'react';

interface CrewmateAvatarProps {
  color?: string; // 'cyan' | 'red' | 'lime' | 'purple' | 'orange' | 'yellow' | 'pink'
  size?: number;  // px height
  animated?: boolean;
  label?: string;
  isReady?: boolean;
}

const colorMap: Record<string, { body: string; shadow: string; visor: string }> = {
  cyan: { body: '#38fedc', shadow: '#1bb59b', visor: '#99f6ff' },
  red: { body: '#c51111', shadow: '#7a0808', visor: '#99f6ff' },
  lime: { body: '#50ef39', shadow: '#229e10', visor: '#99f6ff' },
  purple: { body: '#6b2fbb', shadow: '#3f1875', visor: '#99f6ff' },
  orange: { body: '#ef7d0d', shadow: '#a65002', visor: '#99f6ff' },
  yellow: { body: '#f5f557', shadow: '#adad18', visor: '#99f6ff' },
  pink: { body: '#ed54ba', shadow: '#a8267e', visor: '#99f6ff' },
};

export const CrewmateAvatar: React.FC<CrewmateAvatarProps> = ({
  color = 'cyan',
  size = 80,
  animated = true,
  label,
  isReady = true,
}) => {
  const palette = colorMap[color] || colorMap.cyan;

  return (
    <div className={`flex flex-col items-center justify-center ${animated ? 'animate-float' : ''}`}>
      <svg
        width={size * 0.8}
        height={size}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
      >
        {/* Backpack */}
        <rect x="5" y="45" width="22" height="42" rx="10" fill={palette.shadow} stroke="#000" strokeWidth="6" />

        {/* Legs */}
        <rect x="25" y="80" width="20" height="35" rx="8" fill={palette.shadow} stroke="#000" strokeWidth="6" />
        <rect x="55" y="80" width="20" height="35" rx="8" fill={palette.shadow} stroke="#000" strokeWidth="6" />

        {/* Main Body Shadow */}
        <path
          d="M 22 25 C 22 10, 78 10, 78 25 L 78 90 C 78 100, 22 100, 22 90 Z"
          fill={palette.shadow}
          stroke="#000"
          strokeWidth="6"
        />

        {/* Main Body */}
        <path
          d="M 22 25 C 22 10, 78 10, 78 25 L 78 85 C 78 95, 22 95, 22 85 Z"
          fill={palette.body}
          stroke="#000"
          strokeWidth="6"
        />

        {/* Visor Glass Outer */}
        <ellipse cx="62" cy="38" rx="22" ry="15" fill="#283a45" stroke="#000" strokeWidth="5" />

        {/* Visor Glass Inner Fill */}
        <ellipse cx="62" cy="38" rx="18" ry="12" fill={palette.visor} />

        {/* Visor Glass Shine Reflection */}
        <ellipse cx="66" cy="34" rx="10" ry="5" fill="#ffffff" opacity="0.8" />
      </svg>

      {label && (
        <div className="mt-2 text-center">
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-space-800 border border-cyber-cyan/30 text-slate-200 tracking-wider font-chakra block">
            {label}
          </span>
          <span
            className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 block ${
              isReady ? 'text-cyber-neon' : 'text-amber-400'
            }`}
          >
            {isReady ? 'READY' : 'WAITING'}
          </span>
        </div>
      )}
    </div>
  );
};
