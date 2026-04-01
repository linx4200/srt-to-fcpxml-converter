import { Smartphone, Monitor } from 'lucide-react';
import { SettingButton } from './SettingButton';

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
        <SettingButton
          isActive={orientation === 'portrait'}
          onClick={() => onChange('portrait')}
        >
          <Smartphone size={20} />
          <span className="text-xs font-medium">Portrait (9:16)</span>
        </SettingButton>
        <SettingButton
          isActive={orientation === 'landscape'}
          onClick={() => onChange('landscape')}
          disabled
        >
          <Monitor size={20} />
          <span className="text-xs font-medium">Landscape (16:9)</span>
        </SettingButton>
      </div>
    </section>
  );
}
