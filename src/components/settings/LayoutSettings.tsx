import { Smartphone, Monitor } from 'lucide-react';
import { SettingButton } from './SettingButton';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

export function LayoutSettings() {
  const { t } = useI18n();
  const orientation = useAppStore((state) => state.subtitleStyle.orientation);
  const updateSubtitleStyle = useAppStore((state) => state.updateSubtitleStyle);

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('videoLayout')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <SettingButton
          isActive={orientation === 'portrait'}
          onClick={() => updateSubtitleStyle({ orientation: 'portrait' })}
        >
          <Smartphone size={20} />
          <span className="text-xs font-medium">{t('portrait')}</span>
        </SettingButton>
        <SettingButton
          isActive={orientation === 'landscape'}
          onClick={() => updateSubtitleStyle({ orientation: 'landscape' })}
          disabled
        >
          <Monitor size={20} />
          <span className="text-xs font-medium">{t('landscape')}</span>
        </SettingButton>
      </div>
    </section>
  );
}
