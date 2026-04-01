import { motion } from 'motion/react';
import { ChevronLeft, Copy, Search, Share, Heart, Star, MessageCircle, Edit2, List, Layers, ChevronDown, Wifi, BatteryFull } from 'lucide-react';

interface XhsOverlayProps {
  currentTime: number;
  totalDuration: number;
}

export function XhsOverlay({ currentTime, totalDuration }: XhsOverlayProps) {
  const progress = totalDuration > 0 ? Math.min(Math.max(currentTime / totalDuration, 0), 1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col justify-between"
    >
      {/* iOS Status Bar Mock */}
      <div className="absolute top-0 left-0 right-0 h-9 flex justify-between items-center px-6 text-white text-[13px] font-semibold drop-shadow-md z-50 tracking-wide">
        <span>18:44</span>
        <div className="flex items-center gap-1.5">
          <Wifi size={14} strokeWidth={2.5} className="ml-1 opacity-90" />
          <BatteryFull size={18} strokeWidth={2} className="opacity-90" />
        </div>
      </div>

      {/* XHS Mock UI - Top Bar */}
      <div className="pt-12 px-4 flex justify-between items-center opacity-80">
        <div className="flex items-center gap-4">
          <ChevronLeft size={24} className="text-white drop-shadow-md" />
          <Copy size={20} className="text-white drop-shadow-md" />
        </div>
        <div className="flex items-center gap-4">
          <Search size={20} className="text-white drop-shadow-md" />
          <Share size={20} className="text-white drop-shadow-md" />
        </div>
      </div>

      {/* Bottom Area (Inside Video) */}
      <div className="flex flex-col opacity-100 relative">
        <div className="px-4 pb-3 flex flex-col gap-2">
          {/* User Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/30 border border-white/20 overflow-hidden shrink-0" />
              <span className="text-white text-[14px] font-medium ml-2 drop-shadow-sm">闹钟响了就起床</span>
              <div className="bg-[#ff2442] text-white text-[12px] px-2.5 py-0.5 rounded-full ml-2 font-medium tracking-wide">关注</div>
            </div>
          </div>

          {/* Description & Chapters inline */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 bg-black/20 border border-white/20 text-white/90 text-[12px] px-1.5 py-0.5 rounded backdrop-blur-sm shrink-0">
              <List size={12} />
              <span>章节</span>
              <ChevronDown size={10} className="opacity-70 -ml-0.5" />
            </div>
            <div className="text-white/80 text-[12px] drop-shadow-md line-clamp-1 flex-1">
              ⬆️ 请关注 @闹钟响了就起床
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1 text-white/80 text-[11px] bg-black/30 self-start px-2 py-0.5 rounded backdrop-blur-sm mt-0.5 mb-1">
            <Layers size={12} />
            <span>合集 · xinranliu.me 🌐 | 去看看</span>
          </div>
        </div>
      </div>


      {/* Time progress bar (Dimmed to prevent interaction confusion) */}
      <div className="absolute bottom-0 left-4 right-4 flex items-center h-[1.5px]">
        <div
          className="h-full bg-white/80 rounded-l-full"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="h-full bg-white/20 rounded-r-full"
          style={{ width: `${(1 - progress) * 100}%` }}
        />
      </div>
    </motion.div>
  );
}

export function XhsBottomBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#0a0a0a] w-full px-4 py-2 h-14 flex items-center justify-between"
    >
      {/* Bottom Input & Interaction Bar */}
      <div className="flex items-center gap-2 bg-white/10 rounded-full h-8 flex-1 mr-4 px-2">
        <Edit2 size={12} className="text-white/40" />
        {/* <span className="text-white/40 text-[10px]"></span> */}
      </div>
      <div className="flex items-center gap-4 text-white">
        <div className="flex items-center gap-1">
          <Heart size={26} />
          <span className="text-[11px] font-medium">86</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={26} />
          <span className="text-[11px] font-medium">72</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={26} />
          <span className="text-[11px] font-medium">17</span>
        </div>
      </div>
    </motion.div>
  );
}

export const xhsBottomHeightSpacing = 14;
