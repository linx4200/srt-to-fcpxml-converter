import { SettingButton } from './SettingButton';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

export function FpsSettings() {
  const { t } = useI18n();
  const fps = useAppStore((state) => state.subtitleStyle.fps);
  const updateSubtitleStyle = useAppStore((state) => state.updateSubtitleStyle);

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('frameRate')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <SettingButton
          isActive={fps === 30}
          onClick={() => updateSubtitleStyle({ fps: 30 })}
          className="justify-center"
        >
          <span className="text-xs font-medium">30 FPS</span>
        </SettingButton>
        <SettingButton
          isActive={fps === 60}
          onClick={() => updateSubtitleStyle({ fps: 60 })}
          className="justify-center"
        >
          <span className="text-xs font-medium">60 FPS</span>
        </SettingButton>
      </div>
    </section>
  );
}
