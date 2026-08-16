import { Music2 } from 'lucide-react';
import { SettingButton } from './SettingButton';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

export function PlatformSettings() {
  const { t } = useI18n();
  const platform = useAppStore((state) => state.subtitleStyle.platform);
  const orientation = useAppStore((state) => state.subtitleStyle.orientation);
  const updateSubtitleStyle = useAppStore((state) => state.updateSubtitleStyle);
  const platformOptions: ('none' | 'xhs' | 'douyin')[] = ['none', 'xhs', 'douyin'];

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('overlay')}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {platformOptions.map((platformOption) => {
          const isLandscapePlatformDisabled = orientation === 'landscape' && platformOption !== 'none';

          return (
            <SettingButton
              key={platformOption}
              isActive={platform === platformOption}
              onClick={() => updateSubtitleStyle({ platform: platformOption })}
              disabled={isLandscapePlatformDisabled}
              className="w-full justify-center px-2"
            >
              {platformOption === 'none' && <span className="text-xs font-medium">{t('overlayClean')}</span>}
              {platformOption === 'xhs' && (
                <>
                  <span className="text-xs font-medium">🍠</span>
                  <span className="text-xs font-medium">{t('overlayRednote')}</span>
                </>
              )}
              {platformOption === 'douyin' && (
                <>
                  <Music2 size={15} />
                  <span className="text-xs font-medium">{t('overlayTiktok')}</span>
                </>
              )}
            </SettingButton>
          );
        })}
      </div>
    </section>
  );
}
