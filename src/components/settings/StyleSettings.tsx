import { useEffect, useState } from 'react';
import { SubtitleStyle } from '../../types';
import { useI18n } from '../../i18n';

interface StyleSettingsProps {
  style: SubtitleStyle;
  onChange: (style: SubtitleStyle) => void;
}

const MIN_FONT_SIZE = 20;
const MAX_FONT_SIZE = 80;

export function StyleSettings({ style, onChange }: StyleSettingsProps) {
  const { t } = useI18n();
  const [fontSizeInput, setFontSizeInput] = useState(String(style.fontSize));

  useEffect(() => {
    setFontSizeInput(String(style.fontSize));
  }, [style.fontSize]);

  const updateFontSize = (fontSize: number) => {
    const nextFontSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, fontSize));
    onChange({ ...style, fontSize: nextFontSize });
    return nextFontSize;
  };

  const commitFontSizeInput = (value: string) => {
    if (value.trim() === '') {
      setFontSizeInput(String(style.fontSize));
      return;
    }

    const parsedValue = parseInt(value, 10);
    if (Number.isNaN(parsedValue)) {
      setFontSizeInput(String(style.fontSize));
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
            value={style.fontSize}
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
            value={style.textColor}
            onChange={(e) => onChange({ ...style, textColor: e.target.value })}
            className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
          />
        </div>
        {/* 由于 FCPX 不支持字幕自动背景，暂时隐藏下列设置
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Background</span>
          <input
            type="color"
            value={style.backgroundColor}
            onChange={(e) => onChange({ ...style, backgroundColor: e.target.value })}
            className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
          />
        </div>
        */}

        {/* Sliders */}
        {/* todo: 支持输入修改 */}
        {/* 由于 FCPX 不支持字幕自动背景，暂时隐藏
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Opacity</span>
            <span>{Math.round(style.backgroundOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={style.backgroundOpacity}
            onChange={(e) => onChange({ ...style, backgroundOpacity: parseFloat(e.target.value) })}
            className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Corner Radius</span>
            <span>{style.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={style.borderRadius}
            onChange={(e) => onChange({ ...style, borderRadius: parseInt(e.target.value) })}
            className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/40">
              <span>Padding X</span>
              <span>{style.paddingX}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={style.paddingX}
              onChange={(e) => onChange({ ...style, paddingX: parseInt(e.target.value) })}
              className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/40">
              <span>Padding Y</span>
              <span>{style.paddingY}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={style.paddingY}
              onChange={(e) => onChange({ ...style, paddingY: parseInt(e.target.value) })}
              className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        */}
      </div>
    </section>
  );
}
