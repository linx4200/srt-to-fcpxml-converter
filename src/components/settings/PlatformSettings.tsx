interface PlatformSettingsProps {
  platform: 'none' | 'xhs' | 'douyin';
  onChange: (platform: 'none' | 'xhs' | 'douyin') => void;
}

export function PlatformSettings({ platform, onChange }: PlatformSettingsProps) {
  const platforms: ('none' | 'xhs' | 'douyin')[] = ['none', 'xhs', 'douyin'];
  
  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        UI Preview Overlay
      </label>
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              platform === p
                ? 'bg-white text-black border-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            {p === 'none' ? 'Clean' : p === 'xhs' ? 'Xiaohongshu' : 'Douyin'}
          </button>
        ))}
      </div>
    </section>
  );
}
