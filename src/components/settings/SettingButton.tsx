import React from 'react';

interface SettingButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SettingButton({ isActive, onClick, children, className = '' }: SettingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 p-3 rounded-xl border transition-all hover:cursor-pointer ${
        isActive
          ? 'bg-theme-primary/10 border-theme-primary text-theme-primary'
          : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
      } ${className}`}
    >
      {children}
    </button>
  );
}