import React from 'react';

export const NeonIcon: React.FC<{ icon: React.ReactNode; className?: string }> = ({ icon, className = '' }) => (
  <span
    className={
      'inline-flex items-center justify-center animate-pulse-neon ' +
      'neon-glow ' +
      (className || '')
    }
    style={{ filter: 'drop-shadow(0 0 8px #00e0ff) drop-shadow(0 0 16px #00e0ff)' }}
  >
    {icon}
  </span>
);

// Add neon-glow animation to global CSS if not present
