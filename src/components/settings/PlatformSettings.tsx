import { Music2 } from 'lucide-react';
import { SettingButton } from './SettingButton';
import { useI18n } from '../../i18n';

interface PlatformSettingsProps {
  platform: 'none' | 'xhs' | 'douyin';
  onChange: (platform: 'none' | 'xhs' | 'douyin') => void;
}

export function PlatformSettings({ platform, onChange }: PlatformSettingsProps) {
  const { t } = useI18n();
  const platforms: ('none' | 'xhs' | 'douyin')[] = ['none', 'xhs', 'douyin'];

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('overlay')}
      </label>
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <SettingButton
            key={p}
            isActive={platform === p}
            onClick={() => onChange(p)}
          >
              {p === 'none' && <span className="text-xs font-medium">{t('overlayClean')}</span>}
              {p === 'xhs' && <><span className="text-xs font-medium">🍠</span><span className="text-xs font-medium">{t('overlayRednote')}</span></>}
              {p === 'douyin' && <><Music2 size={15} /><span className="text-xs font-medium">{t('overlayTiktok')}</span></>}
          </SettingButton>
        ))}
      </div>
    </section>
  );
}
