<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b6a99bf5-50be-4b0d-8dda-6996c077a4e5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


todo: 写 README

## ⚠️ 为什么不支持字幕背景？

在使用本工具并导入 FCP (Final Cut Pro) 时，您可能会注意到生成的字幕并没有承载纯色或半透明的背景圆角矩形盒子。这是由 Apple FCPXML 的原生底层机制作出的妥协手段：

1. **自定义基础字幕的局限性**：我们选用的转化底层引擎是苹果基础内置的 `Custom.moti` (自定) 标题模块，旨在覆盖从 FCP 10.x 到 FCP 12.x 所有的用户无需安装插件即可直接导流。然而 FCPX 核心框架中，常规的自由字幕 (Title) 并未开放能够基于文字尺寸自动弹性延展的内置原生背景盒（Bounding Box）参数。所以即使强行用 XML 渲染背景颜色，也无法生成倒角（Radius）与内边距（Padding）完全自适应的纯黑矩形。
2. **隐藏式字幕的硬伤**：苹果确实在「隐藏式字幕 (Captions，如 CEA-608 / iTT)」中提供了完美自适应的倒角黑底，但它在 FCPX 甚至时间线上的位置是被版心完全锁死保护的，根本无法像短视频一样任意上下游动平移，更无法应用生动的出入场动画，极度阻挡社交流排版自由。

todo: 界面上 1. 增加 .src 生成方法的图文教程展示板块。  2. 增加 .fcpxml 导入 Final Cut Pro 的图文教程展示板块。