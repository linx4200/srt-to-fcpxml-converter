import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

interface RangeSettingProps {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

/* 字号范围对应当前预览与 FCPXML 导出的可控字号区间。 */
const MIN_FONT_SIZE = 20;
const MAX_FONT_SIZE = 80;
/* UI 展示百分比时使用的倍率，底层状态仍保持 0-1。 */
const PERCENTAGE_DISPLAY_MULTIPLIER = 100;
/* 背景透明度用 0-1 写入预览和 FCPXML，1% 步进便于细调。 */
const BACKGROUND_OPACITY_RANGE = { min: 0, max: 1, step: 0.01 } as const;
/* 圆角是产品层 px 值，导出时会按 Target Video Orientation 换算为 FCP Roundness。 */
const BORDER_RADIUS_RANGE = { min: 0, max: 40, step: 1 } as const;
/* 背景框宽度使用当前 Target Video Orientation 的 FCP 参考像素，范围覆盖常见单双行字幕底板。 */
const BACKGROUND_WIDTH_RANGE = { min: 200, max: 1200, step: 10 } as const;
/* 背景框高度使用当前 Target Video Orientation 的 FCP 参考像素，范围覆盖单行到双行字幕底板。 */
const BACKGROUND_HEIGHT_RANGE = { min: 40, max: 260, step: 10 } as const;

function RangeSetting({
  label,
  valueLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
}: RangeSettingProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-xs font-medium text-white/60">{label}</span>
        <span className="text-xs text-white/40">{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-theme-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

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
            <span className="text-xs font-medium text-white/60">{t('fontSize')}</span>
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
                className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-xs text-white outline-none transition focus:border-white/30"
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">{t('textColor')}</span>
            <input
              type="color"
              aria-label={t('textColor')}
              value={subtitleStyle.textColor}
              onChange={(event) => updateSubtitleStyle({ textColor: event.target.value })}
              className="h-8 w-8 cursor-pointer rounded-lg border-none bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">{t('backgroundColor')}</span>
            <input
              type="color"
              aria-label={t('backgroundColor')}
              value={subtitleStyle.backgroundColor}
              onChange={(event) => updateSubtitleStyle({ backgroundColor: event.target.value })}
              className="h-8 w-8 cursor-pointer rounded-lg border-none bg-transparent"
            />
          </div>
        </div>

        <RangeSetting
          label={t('backgroundOpacity')}
          valueLabel={`${Math.round(subtitleStyle.backgroundOpacity * PERCENTAGE_DISPLAY_MULTIPLIER)}%`}
          min={BACKGROUND_OPACITY_RANGE.min}
          max={BACKGROUND_OPACITY_RANGE.max}
          step={BACKGROUND_OPACITY_RANGE.step}
          value={subtitleStyle.backgroundOpacity}
          onChange={(backgroundOpacity) => updateSubtitleStyle({ backgroundOpacity })}
        />

        <RangeSetting
          label={t('cornerRadius')}
          valueLabel={`${subtitleStyle.borderRadius}px`}
          min={BORDER_RADIUS_RANGE.min}
          max={BORDER_RADIUS_RANGE.max}
          step={BORDER_RADIUS_RANGE.step}
          value={subtitleStyle.borderRadius}
          onChange={(borderRadius) => updateSubtitleStyle({ borderRadius })}
        />

        <div className="grid grid-cols-2 gap-4">
          <RangeSetting
            label={t('backgroundWidth')}
            valueLabel={`${subtitleStyle.backgroundWidth}px`}
            min={BACKGROUND_WIDTH_RANGE.min}
            max={BACKGROUND_WIDTH_RANGE.max}
            step={BACKGROUND_WIDTH_RANGE.step}
            value={subtitleStyle.backgroundWidth}
            onChange={(backgroundWidth) => updateSubtitleStyle({ backgroundWidth })}
          />
          <RangeSetting
            label={t('backgroundHeight')}
            valueLabel={`${subtitleStyle.backgroundHeight}px`}
            min={BACKGROUND_HEIGHT_RANGE.min}
            max={BACKGROUND_HEIGHT_RANGE.max}
            step={BACKGROUND_HEIGHT_RANGE.step}
            value={subtitleStyle.backgroundHeight}
            onChange={(backgroundHeight) => updateSubtitleStyle({ backgroundHeight })}
          />
        </div>
      </div>
    </section>
  );
}
