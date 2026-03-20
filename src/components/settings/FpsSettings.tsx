interface FpsSettingsProps {
  fps: 30 | 60;
  onChange: (fps: 30 | 60) => void;
}

export function FpsSettings({ fps, onChange }: FpsSettingsProps) {
  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        Frame Rate
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange(30)}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            fps === 30
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
              : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
          }`}
        >
          <span className="text-xs font-medium">30 FPS</span>
        </button>
        <button
          onClick={() => onChange(60)}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            fps === 60
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
              : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
          }`}
        >
          <span className="text-xs font-medium">60 FPS</span>
        </button>
      </div>
    </section>
  );
}
