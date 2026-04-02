import type { Language } from './i18n';

type SeoConfig = {
  title: string;
  description: string;
  keywords: string;
  locale: string;
};

const SITE_NAME = 'SRT to FCPXML Converter';
const DEFAULT_IMAGE_PATH = '/docs/intro_screenshot.png';
const AUTHOR_WEBSITE_URL = 'https://xinranliu.me/';
const GITHUB_REPO_URL = 'https://github.com/linx4200/srt-to-fcpxml-converter';
const CANONICAL_URL = 'https://xinranliu.me/';
const JSON_LD_ID = 'app-seo-json-ld';

const SEO_BY_LANGUAGE: Record<Language, SeoConfig> = {
  zh: {
    title: 'SRT 转 FCPXML 转换器 | Final Cut Pro 字幕导入工具',
    description:
      '浏览器内将 SRT 字幕转换为 Final Cut Pro 可导入的 FCPXML，支持自动拆行、音频波形预览、字幕编辑和短视频浮层预览。',
    keywords:
      'SRT 转 FCPXML,FCPXML 转换器,Final Cut Pro 字幕,字幕转换,在线字幕工具,短视频字幕',
    locale: 'zh_CN',
  },
  en: {
    title: 'SRT to FCPXML Converter | Final Cut Pro Subtitle Tool',
    description:
      'Convert SRT subtitles into Final Cut Pro compatible FCPXML in the browser with auto line splitting, waveform preview, subtitle editing, and short-form UI overlays.',
    keywords:
      'SRT to FCPXML,FCPXML converter,Final Cut Pro subtitles,subtitle converter,browser subtitle tool,short-form video subtitles',
    locale: 'en_US',
  },
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement('meta');
    document.head.appendChild(meta);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    meta!.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let link = document.head.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement('link');
    document.head.appendChild(link);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    link!.setAttribute(key, value);
  });
}

function getAbsoluteUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

function isIndexableUrl() {
  const { hostname, protocol } = window.location;
  return protocol === 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1';
}

export function syncSeo(language: Language) {
  const seo = SEO_BY_LANGUAGE[language];
  const canonicalUrl = CANONICAL_URL;
  const imageUrl = getAbsoluteUrl(DEFAULT_IMAGE_PATH);
  const robots = isIndexableUrl() ? 'index,follow' : 'noindex,nofollow';

  document.title = seo.title;

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: seo.description,
  });
  upsertMeta('meta[name="keywords"]', {
    name: 'keywords',
    content: seo.keywords,
  });
  upsertMeta('meta[name="robots"]', {
    name: 'robots',
    content: robots,
  });
  upsertMeta('meta[name="theme-color"]', {
    name: 'theme-color',
    content: '#0f0f0f',
  });
  upsertMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: 'website',
  });
  upsertMeta('meta[property="og:site_name"]', {
    property: 'og:site_name',
    content: SITE_NAME,
  });
  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: seo.title,
  });
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: seo.description,
  });
  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: seo.locale,
  });
  upsertMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: canonicalUrl,
  });
  upsertMeta('meta[property="og:image"]', {
    property: 'og:image',
    content: imageUrl,
  });
  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary_large_image',
  });
  upsertMeta('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: seo.title,
  });
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: seo.description,
  });
  upsertMeta('meta[name="twitter:image"]', {
    name: 'twitter:image',
    content: imageUrl,
  });

  upsertLink('link[rel="canonical"]', {
    rel: 'canonical',
    href: canonicalUrl,
  });

  let jsonLdScript = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = JSON_LD_ID;
    jsonLdScript.type = 'application/ld+json';
    document.head.appendChild(jsonLdScript);
  }

  jsonLdScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    inLanguage: language === 'zh' ? 'zh-CN' : 'en',
    headline: seo.title,
    description: seo.description,
    image: imageUrl,
    url: canonicalUrl,
    browserRequirements: 'Requires JavaScript. Works in modern browsers.',
    creator: {
      '@type': 'Person',
      name: 'Xinran Liu',
      url: AUTHOR_WEBSITE_URL,
    },
    sameAs: [AUTHOR_WEBSITE_URL, GITHUB_REPO_URL],
  });
}
