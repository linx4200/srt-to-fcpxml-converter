import { Smartphone, Monitor } from 'lucide-react';
import { SettingButton } from './SettingButton';
import { useI18n } from '../../i18n';

interface LayoutSettingsProps {
  orientation: 'landscape' | 'portrait';
  onChange: (orientation: 'landscape' | 'portrait') => void;
}

export function LayoutSettings({ orientation, onChange }: LayoutSettingsProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('videoLayout')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <SettingButton
          isActive={orientation === 'portrait'}
          onClick={() => onChange('portrait')}
        >
          <Smartphone size={20} />
          <span className="text-xs font-medium">{t('portrait')}</span>
        </SettingButton>
        <SettingButton
          isActive={orientation === 'landscape'}
          onClick={() => onChange('landscape')}
          disabled
        >
          <Monitor size={20} />
          <span className="text-xs font-medium">{t('landscape')}</span>
        </SettingButton>
      </div>
    </section>
  );
}
