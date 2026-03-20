import { SubtitleStyle } from '../../types';

interface StyleSettingsProps {
  style: SubtitleStyle;
  onChange: (style: SubtitleStyle) => void;
}

export function StyleSettings({ style, onChange }: StyleSettingsProps) {
  return (
    <section className="space-y-6">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        Subtitle Style
      </label>
      
      <div className="space-y-4">
        {/* Colors */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Text Color</span>
          <input
            type="color"
            value={style.textColor}
            onChange={(e) => onChange({ ...style, textColor: e.target.value })}
            className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Background</span>
          <input
            type="color"
            value={style.backgroundColor}
            onChange={(e) => onChange({ ...style, backgroundColor: e.target.value })}
            className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
          />
        </div>

        {/* Sliders */}
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
            className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
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
            className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
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
              className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
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
              className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
