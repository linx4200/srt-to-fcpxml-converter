import { motion } from 'motion/react';

export function CleanOverlay() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
    >
      {/* 纯净模式下目前没有遮罩元素，但也保留统一的外层结构以便日后扩展安全区提示等功能 */}
    </motion.div>
  );
}
