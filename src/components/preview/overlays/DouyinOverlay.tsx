import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  BatteryFull,
  Star,
  Heart,
  Menu,
  MessageCircle,
  Search,
  MessageSquareShare,
  Wifi,
  Layers
} from 'lucide-react';

function ActionItem({
  icon,
  count,
  withAvatar = false,
  hidden = false
}: {
  icon: ReactNode;
  count?: string;
  withAvatar?: boolean;
  hidden?: boolean;
}) {
  return (
    <div className={`${hidden ? 'opacity-0' : ''} flex flex-col items-center gap-1 relative `}>
      <div className="relative">
        <div
          className={
            withAvatar
              ? 'w-10 h-10 rounded-full border-2 border-white/85'
              : 'w-10 h-10 flex items-center justify-center'
          }
        >
          {icon}
        </div>
        {withAvatar && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#ff244d] border-white flex items-center justify-center">
            <span className="text-[16px] leading-none font-bold text-white">+</span>
          </div>
        )}
      </div>
      {count ? <span className="text-[12px] font-medium leading-none">{count}</span> : null}
    </div>
  );
}

interface DouyinOverlayProps {
  currentTime: number;
  totalDuration: number;
}

export function DouyinOverlay({ currentTime, totalDuration }: DouyinOverlayProps) {
  const progress = totalDuration > 0 ? Math.min(Math.max(currentTime / totalDuration, 0), 1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-hidden text-white"
    >

      {/* iOS Status Bar Mock */}
      <div className="absolute top-0 left-0 right-0 h-9 flex justify-between items-center px-6 text-white text-[13px] font-semibold drop-shadow-md z-50 tracking-wide">
        <span>18:44</span>
        <div className="flex items-center gap-1.5">
          <Wifi size={14} strokeWidth={2.5} className="ml-1 opacity-90" />
          <BatteryFull size={18} strokeWidth={2} className="opacity-90" />
        </div>
      </div>

      <div className="absolute top-12 left-0 right-0 px-4 flex items-center justify-between z-20">
        <Menu size={20} strokeWidth={2.3} className="drop-shadow-md" />
        <div className="flex items-center gap-4 text-[16px] text-white/55">
          <span>直播</span>
          <span>团购</span>
          <span>同城</span>
          <span>关注</span>
          <span>商城</span>
          <span className="text-white relative">
            推荐
            <span className="absolute left-1/2 -translate-x-1/2 top-[24px] w-4 h-[2px] rounded-full bg-white" />
          </span>
        </div>
        <Search size={20} strokeWidth={2.4} className="drop-shadow-md shrink-0" />
      </div>

      <div className="absolute right-3 bottom-11 flex flex-col items-center gap-2 z-20">
        <ActionItem
          withAvatar
          icon={<div className="w-full h-full rounded-full bg-white/50"/>}
        />
        <ActionItem icon={<Heart size={26} fill="white" />} count="598" />
        <ActionItem icon={<MessageCircle size={26} fill="white" />} count="108" />
        <ActionItem icon={<Star size={26} fill="white" />} count="67" />
        <ActionItem icon={<MessageSquareShare size={26} />} count="12" />
        {/* this is a space placeholder */}
        <ActionItem hidden icon={<MessageSquareShare size={26}/>} />
      </div>

      <div className="absolute left-4 right-4 bottom-11 z-20">
        <div className="text-[14px] font-semibold leading-none">@闹钟响了就起床</div>
        <p className="mt-3 max-w-[270px] text-[12px] leading-[1.35] text-white/80">
          请在小红书🍠上关注 @闹钟响了就起床 ｜ 提 Bug 请到 Github ... 展开
        </p>
      </div>

      <div className="absolute left-0 right-0 bottom-0 z-20 pl-4 pr-4 h-8 bg-black/20 flex items-center justify-between text-[12px] text-white/90">
          <div className="flex items-center gap-2">
            <Layers size={12} />
            <span>合集 · xinranliu.me </span>
          </div>
          <span className="text-lg leading-none text-white/70">›</span>

        <div className="absolute left-4 right-4 bottom-0 h-[2px] rounded-full bg-white/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function DouyinBottomBar() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-[#111111] w-full shrink-0 text-white"
    >
      <div className="h-14 px-6 flex items-center justify-between text-[16px] font-semibold border-t border-white/10">
        <span>首页</span>
        <span className="text-white/70">朋友</span>
        <div className="w-8 h-7 rounded-[10px] border-2 border-white flex items-center justify-center text-[18px] leading-none font-medium">
          +
        </div>
        <span className="text-white/70">消息</span>
        <span className="text-white/70">我</span>
      </div>
    </motion.div>
  );
}

export const douyinBottomHeightSpacing = 14;
