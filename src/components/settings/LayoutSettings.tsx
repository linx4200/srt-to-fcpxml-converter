import { Smartphone, Monitor } from 'lucide-react';
import { SettingButton } from './SettingButton';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import type { TargetVideoOrientation } from '../../domain/subtitleStyle';

export function LayoutSettings() {
  const { t } = useI18n();
  const orientation = useAppStore((state) => state.subtitleStyle.orientation);
  const sourceSrtEntries = useAppStore((state) => state.sourceSrtEntries);
  const changeTargetVideoOrientation = useAppStore((state) => state.changeTargetVideoOrientation);

  /* 切换 Target Video Orientation 会从 Imported SRT Snapshot 重建 Working Timeline，因此由交互入口负责确认。 */
  const handleTargetVideoOrientationChange = (targetVideoOrientation: TargetVideoOrientation) => {
    if (orientation === targetVideoOrientation) return;

    if (sourceSrtEntries.length > 0) {
      const shouldContinue = window.confirm(t('confirmTargetVideoOrientationChange'));
      if (!shouldContinue) return;
    }

    changeTargetVideoOrientation(targetVideoOrientation);
  };

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('videoLayout')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <SettingButton
          isActive={orientation === 'portrait'}
          onClick={() => handleTargetVideoOrientationChange('portrait')}
        >
          <Smartphone size={20} />
          <span className="text-xs font-medium">{t('portrait')}</span>
        </SettingButton>
        <SettingButton
          isActive={orientation === 'landscape'}
          onClick={() => handleTargetVideoOrientationChange('landscape')}
        >
          <Monitor size={20} />
          <span className="text-xs font-medium">{t('landscape')}</span>
        </SettingButton>
      </div>
    </section>
  );
}
