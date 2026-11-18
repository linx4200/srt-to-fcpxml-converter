/* 仅记录已定义的产品节点，不发送字幕、文件名或媒体内容。 */
type AnalyticsEvent =
  | 'subtitle_file_selected'
  | 'subtitle_processing_succeeded'
  | 'subtitle_processing_failed'
  | 'download_started'
  | 'editing_completed';

type UmamiWindow = Window & {
  umami?: { track: (event: AnalyticsEvent) => void | Promise<unknown> };
};

/* 在 React 生命周期之外加载一次，避免 StrictMode 重复初始化浏览统计。 */
export function initializeAnalytics() {
  if (!import.meta.env.PROD) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.dataset.websiteId = '4196bb75-0a55-4cf5-84fb-5475dec978d0';
  document.head.appendChild(script);
}

export function trackAnalyticsEvent(event: AnalyticsEvent) {
  if (!import.meta.env.PROD) return;

  // 统计脚本不可用或请求失败时，仍正常执行用户操作。
  try {
    const result = (window as UmamiWindow).umami?.track(event);
    void Promise.resolve(result).catch(() => {});
  } catch {
    // 统计失败不进入业务错误处理流程。
  }
}
