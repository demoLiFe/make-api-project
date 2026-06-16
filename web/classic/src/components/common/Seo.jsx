import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLogo, getSystemName } from '../../helpers';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://api.make1688.com')
  .replace(/\/+$/, '');

const DEFAULT_IMAGE = '/make-api-mark.svg';

const SEO_ROUTES = {
  '/': {
    title: 'Make API - AI API Gateway and Model Routing Console',
    description:
      'Make API provides an OpenAI-compatible AI API gateway for model routing, pricing visibility, usage analytics, and private deployment management.',
    keywords:
      'AI API gateway, OpenAI compatible API, model routing, API relay, LLM gateway',
  },
  '/pricing': {
    title: 'AI Model Pricing - Make API',
    description:
      'Compare enabled AI models, providers, endpoint capabilities, and token pricing in one searchable model directory.',
    keywords:
      'AI model pricing, LLM pricing, token pricing, OpenAI compatible models, model directory',
  },
  '/docs': {
    title: 'API Documentation - Make API',
    description:
      'Read Make API client integration guides for OpenAI-compatible, Claude-compatible, and Gemini-compatible API access.',
    keywords:
      'Make API docs, OpenAI compatible API docs, AI API integration, LLM gateway documentation',
  },
  '/privacy-policy': {
    title: 'Privacy Policy - Make API',
    description:
      'Review the Make API privacy policy for data handling, account information, and platform usage practices.',
  },
  '/user-agreement': {
    title: 'User Agreement - Make API',
    description:
      'Read the Make API user agreement covering platform access, account responsibilities, and acceptable use.',
  },
};

function getRouteSeo(pathname) {
  if (pathname.startsWith('/pricing')) return SEO_ROUTES['/pricing'];
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
