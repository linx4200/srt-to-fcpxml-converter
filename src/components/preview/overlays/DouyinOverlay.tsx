import { motion } from 'motion/react';
import { Music2 } from 'lucide-react';

export function DouyinOverlay() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
    >
      {/* Douyin Mock UI */}
      <div className="absolute top-10 left-0 right-0 flex justify-center gap-8 opacity-40">
        <div className="w-16 h-4 rounded bg-white/20" />
        <div className="w-16 h-4 rounded bg-white/20" />
      </div>
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 opacity-40">
        <div className="w-12 h-12 rounded-full bg-white/20" />
        <div className="w-10 h-10 rounded-full bg-white/20" />
        <div className="w-10 h-10 rounded-full bg-white/20" />
        <div className="w-10 h-10 rounded-full bg-white/20" />
      </div>
      <div className="absolute bottom-10 left-6 right-20 flex flex-col gap-3 opacity-40">
        <div className="w-1/2 h-5 rounded bg-white/20" />
        <div className="w-full h-4 rounded bg-white/20" />
        <div className="flex items-center gap-2">
          <Music2 size={14} />
          <div className="w-32 h-3 rounded bg-white/20" />
        </div>
      </div>
    </motion.div>
  );
}
