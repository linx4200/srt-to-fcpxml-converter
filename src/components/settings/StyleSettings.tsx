import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

const MIN_FONT_SIZE = 20;
const MAX_FONT_SIZE = 80;

export function StyleSettings() {
  const { t } = useI18n();
  const subtitleStyle = useAppStore((state) => state.subtitleStyle);
  const updateSubtitleStyle = useAppStore((state) => state.updateSubtitleStyle);
  const [fontSizeInput, setFontSizeInput] = useState(String(subtitleStyle.fontSize));

  useEffect(() => {
    setFontSizeInput(String(subtitleStyle.fontSize));
  }, [subtitleStyle.fontSize]);

  const updateFontSize = (fontSize: number) => {
    const nextFontSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, fontSize));
    updateSubtitleStyle({ fontSize: nextFontSize });
    return nextFontSize;
  };

  const commitFontSizeInput = (value: string) => {
    if (value.trim() === '') {
      setFontSizeInput(String(subtitleStyle.fontSize));
      return;
    }

    const parsedValue = parseInt(value, 10);
    if (Number.isNaN(parsedValue)) {
      setFontSizeInput(String(subtitleStyle.fontSize));
      return;
    }

    const nextFontSize = updateFontSize(parsedValue);
    setFontSizeInput(String(nextFontSize));
  };

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('subtitleStyle')}
      </label>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span className="text-sm text-white/60">{t('fontSize')}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={MIN_FONT_SIZE}
                max={MAX_FONT_SIZE}
                step="1"
                value={fontSizeInput}
                onChange={(e) => setFontSizeInput(e.target.value)}
                onBlur={(e) => commitFontSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitFontSizeInput(e.currentTarget.value);
                    e.currentTarget.blur();
                  }
                }}
                className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
          </div>
          <input
            type="range"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            step="1"
            value={subtitleStyle.fontSize}
            onChange={(e) => {
              const nextValue = parseInt(e.target.value, 10);
              const nextFontSize = updateFontSize(nextValue);
              setFontSizeInput(String(nextFontSize));
            }}
            className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Colors */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">{t('textColor')}</span>
          <input
            type="color"
            value={subtitleStyle.textColor}
            onChange={(e) => updateSubtitleStyle({ textColor: e.target.value })}
            className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
          />
        </div>
        {/* 横屏 FCPXML 已使用默认背景框；背景调节 UI 等预览同步后再启用。
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Background</span>
          <input
            type="color"
            value={subtitleStyle.backgroundColor}
            onChange={(e) => onChange({ ...subtitleStyle, backgroundColor: e.target.value })}
            className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
          />
        </div>
        */}

        {/* Sliders */}
        {/* todo: 支持输入修改 */}
        {/* 横屏 FCPXML 已使用默认背景框；背景调节 UI 等预览同步后再启用。
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Opacity</span>
            <span>{Math.round(subtitleStyle.backgroundOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={subtitleStyle.backgroundOpacity}
            onChange={(e) => onChange({ ...subtitleStyle, backgroundOpacity: parseFloat(e.target.value) })}
            className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Corner Radius</span>
            <span>{subtitleStyle.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={subtitleStyle.borderRadius}
            onChange={(e) => onChange({ ...subtitleStyle, borderRadius: parseInt(e.target.value) })}
            className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/40">
              <span>Padding X</span>
              <span>{subtitleStyle.paddingX}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={subtitleStyle.paddingX}
              onChange={(e) => onChange({ ...subtitleStyle, paddingX: parseInt(e.target.value) })}
              className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/40">
              <span>Padding Y</span>
              <span>{subtitleStyle.paddingY}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={subtitleStyle.paddingY}
              onChange={(e) => onChange({ ...subtitleStyle, paddingY: parseInt(e.target.value) })}
              className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        */}
      </div>
    </section>
  );
}
