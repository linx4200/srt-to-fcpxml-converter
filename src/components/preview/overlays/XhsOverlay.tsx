import { motion } from 'motion/react';
import { Music2, ChevronLeft, Copy, Search, Share, Heart, Star, MessageCircle, Edit2, List, Layers, Play } from 'lucide-react';

export function XhsOverlay() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none flex flex-col justify-between"
    >
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

      {/* Central Play Button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
        <Play size={64} fill="white" className="text-white drop-shadow-xl" />
      </div>

      {/* Bottom Area */}
      <div className="flex flex-col opacity-100 relative">
        <div className="px-4 pb-3 flex flex-col gap-2">
          {/* User Bar */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/30 border border-white/20 overflow-hidden shrink-0" />
            <span className="text-white text-[15px] font-medium ml-2 drop-shadow-sm">沈叨叨</span>
            <div className="bg-[#ff2442] text-white text-[11px] px-2 py-[1px] rounded-full ml-2 font-medium tracking-wide">关注</div>
          </div>

          {/* Description */}
          <div className="text-white text-[14px] leading-snug drop-shadow-md">
            记住这个搭配，视频满屏+封面完整✔️ 省流版... <span className="text-white/60 text-[13px] ml-1">展开</span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1 text-white/80 text-[11px] bg-black/30 self-start px-2 py-0.5 rounded backdrop-blur-sm mt-0.5">
            <Layers size={12} />
            <span>合集·自媒体入门 | 去看看</span>
          </div>

          {/* Timestamp Chapters */}
          <div className="flex items-center gap-2 mt-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 text-white/90 text-[11px] px-2 py-1 rounded">0:00 尺寸问题</div>
            <div className="bg-black/30 backdrop-blur-sm border border-white/40 text-white text-[11px] px-2 py-1 rounded flex items-center gap-1 font-medium">
              <Music2 size={10}/> 黄金搭配
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 text-white/90 text-[11px] px-2 py-1 rounded">0:18 拍摄技巧</div>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 text-white/90 px-1.5 py-1 rounded flex items-center justify-center">
              <List size={12} />
            </div>
          </div>
        </div>

        {/* Time progress bar */}
        <div className="flex items-center h-[2px] w-full px-4 mb-3 shrink-0">
          <div className="h-full bg-white w-1/3 relative rounded-l-full">
            <div className="w-2 h-2 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 shadow-sm" />
          </div>
          <div className="h-full bg-white/30 w-2/3 rounded-r-full" />
        </div>

        {/* Bottom Input & Interaction Bar */}
        <div className="h-10 px-4 bg-[#0a0a0a] flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/10 rounded-full h-7 flex-1 mr-4 px-3">
            <Edit2 size={12} className="text-white/40" />
            <span className="text-white/40 text-[12px]">说点什么...</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-1">
              <Heart size={18} />
              <span className="text-[11px] font-medium">508</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={18} />
              <span className="text-[11px] font-medium">462</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={18} />
              <span className="text-[11px] font-medium">17</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
