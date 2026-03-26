/**
 * 预览面板与 FCP 渲染引擎的全局常数设定
 */

// FCP 物理分辨率常数
// 作用：决定 Final Cut Pro 导出 XML 时的实际视频分辨率尺寸。
// 也是用来将 FCP 的绝对字号（如 fontSize=50）无缝映射到 Web 自适应宽度的基准分母。
// FCP 的坐标系下，字号 50 代表文字高度将占据 50px（在相应的参考分辨率画幅中）。
export const FCP_RESOLUTION = {
  landscape: {
    width: 1920,
    height: 1080,
  },
  portrait: {
    width: 1080,
    height: 1920,
  }
};

// 模拟器 UI 的逻辑分辨率常数
// 作用：这些像素代表了设备的“逻辑宽度（Logical Pixel）”。
// 在前端布局中，小红书/抖音等平台的覆盖层元素尺寸（如 Tailwind 中的 w-8 即 32px，或是 text-[13px]）
// 是专门针对手机逻辑密度设计的，并非依据背后 1080p 的物理视频分辨率去缩放。
// 提取此基准旨在通过 ResizeObserver 对整个 UI 覆盖层做 CSS transform scale 等比缩放，
// 以完美模拟在一台实际手机（以 iPhone 14/15 为参考系）上的视觉效果。
export const UI_LOGICAL_RESOLUTION = {
  landscape: {
    width: 844,
    height: 390,
  },
  portrait: {
    width: 390,
    height: 844, // 等效于目前最常见的 iPhone 标准长宽比例
  }
};
