import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLogo, getSystemName } from '../../helpers';

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://api.make1688.com'
).replace(/\/+$/, '');

const DEFAULT_IMAGE = '/make-api-mark.svg';

const SEO_ROUTES = {
  '/': {
    title: 'Make API - AI 大模型聚合平台，便宜可靠安全的 API 网关',
    description:
      'Make API 是便宜、可靠、安全的 AI 大模型聚合平台，提供 OpenAI、Claude、Gemini、DeepSeek、Qwen 等大模型 API 统一接入，完美兼容 Codex、OpenCode、Claude Code 等 AI 编程工具。',
    keywords:
      'Make API,make api,AI,大模型,AI大模型,大模型聚合平台,AI聚合平台,API聚合,AI API,OpenAI API,Claude API,Gemini API,DeepSeek API,Qwen API,Codex,OpenCode,Claude Code,AI编程工具,便宜,可靠,安全,模型路由,接口聚合',
  },
  '/pricing': {
    title: 'AI 模型价格 - Make API',
    description:
      '查看 Make API 支持的 AI 模型、服务商、接口能力和 Token 计费信息，快速比较 OpenAI、Claude、Gemini 等模型价格。',
    keywords:
      'AI模型价格,大模型价格,Token计费,OpenAI价格,Claude价格,Gemini价格,模型广场',
  },
  '/docs': {
    title: '快速上手 - Make API',
    description:
      '快速了解 Make API 的 API 接入方式、鉴权配置和 Codex、OpenCode 等客户端集成流程。',
    keywords:
      'Make API快速上手,AI API接入,OpenAI兼容接口,Codex配置,OpenCode配置,大模型接口指南',
  },
  '/status': {
    title: '模型监测 - Make API',
    description: '查看 Make API 模型服务的实时可用率、响应延迟和生成性能。',
    keywords: 'Make API,模型监测,服务状态,模型可用率,API延迟',
  },
  '/privacy-policy': {
    title: '隐私政策 - Make API',
    description:
      '查看 Make API 隐私政策，了解账号信息、平台使用数据和相关信息的处理方式。',
  },
  '/user-agreement': {
    title: '用户协议 - Make API',
    description:
      '阅读 Make API 用户协议，了解平台访问、账号责任、API 使用规范和服务条款。',
  },
};

function getRouteSeo(pathname) {
  if (pathname.startsWith('/pricing')) return SEO_ROUTES['/pricing'];
  if (pathname.startsWith('/status')) return SEO_ROUTES['/status'];
  if (pathname.startsWith('/docs')) return SEO_ROUTES['/docs'];
  return SEO_ROUTES[pathname] || null;
}

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    if (attributes.name) element.setAttribute('name', attributes.name);
    if (attributes.property) {
      element.setAttribute('property', attributes.property);
    }
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export default function Seo() {
  const location = useLocation();

  useEffect(() => {
    const seo = getRouteSeo(location.pathname);
    const siteName = getSystemName() || 'Make API';
    const routeSeo = seo || SEO_ROUTES['/'];
    const title = routeSeo.title.replace(/Make API/g, siteName);
    const canonical = `${SITE_URL}${location.pathname || '/'}`;
    const imagePath = getLogo() || DEFAULT_IMAGE;
    const image = imagePath.startsWith('http')
      ? imagePath
      : `${SITE_URL}${imagePath}`;

    document.documentElement.dataset.seoManaged = 'true';
    document.documentElement.setAttribute('lang', 'zh-CN');
    document.title = title;

    setMeta('meta[name="title"]', { name: 'title', content: title });
    setMeta('meta[name="description"]', {
      name: 'description',
      content: routeSeo.description,
    });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: seo ? 'index,follow' : 'noindex,nofollow',
    });

    if (routeSeo.keywords) {
      setMeta('meta[name="keywords"]', {
        name: 'keywords',
        content: routeSeo.keywords,
      });
    }

    setLink('canonical', canonical);

    setMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    });
    setMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: siteName,
    });
    setMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: title,
    });
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: routeSeo.description,
    });
    setMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonical,
    });
    setMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: image,
    });
    setMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: 'zh_CN',
    });

    setMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    setMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: title,
    });
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: routeSeo.description,
    });
    setMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: image,
    });
  }, [location.pathname]);

  return null;
}
