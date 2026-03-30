import { Smartphone, Monitor } from 'lucide-react';

interface LayoutSettingsProps {
  orientation: 'landscape' | 'portrait';
  onChange: (orientation: 'landscape' | 'portrait') => void;
}

export function LayoutSettings({ orientation, onChange }: LayoutSettingsProps) {
  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        Video Layout
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange('portrait')}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
            orientation === 'portrait'
              ? 'bg-theme-primary/10 border-theme-primary text-theme-primary'
              : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
          }`}
        >
          <Smartphone size={20} />
          <span className="text-xs font-medium">Portrait (9:16)</span>
        </button>
        <button
          onClick={() => onChange('landscape')}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
            orientation === 'landscape'
              ? 'bg-theme-primary/10 border-theme-primary text-theme-primary'
              : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
          }`}
        >
          <Monitor size={20} />
          <span className="text-xs font-medium">Landscape (16:9)</span>
        </button>
      </div>
    </section>
  );
}
