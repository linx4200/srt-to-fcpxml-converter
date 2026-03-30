import { SettingButton } from './SettingButton';

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
        <SettingButton
          isActive={fps === 30}
          onClick={() => onChange(30)}
          className="justify-center"
        >
          <span className="text-xs font-medium">30 FPS</span>
        </SettingButton>
        <SettingButton
          isActive={fps === 60}
          onClick={() => onChange(60)}
          className="justify-center"
        >
          <span className="text-xs font-medium">60 FPS</span>
        </SettingButton>
      </div>
    </section>
  );
}
