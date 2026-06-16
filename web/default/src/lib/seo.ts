import { DEFAULT_LOGO, DEFAULT_SYSTEM_NAME } from './constants'

const DEFAULT_SITE_URL = 'https://api.make1688.com'

export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/+$/, '') || DEFAULT_SITE_URL

export const SEO_DEFAULTS = {
  siteName: DEFAULT_SYSTEM_NAME,
  image: DEFAULT_LOGO,
  locale: 'zh_CN',
  type: 'website',
}

export type SeoRouteKey =
  | 'home'
  | 'pricing'
  | 'rankings'
  | 'about'
  | 'privacyPolicy'
  | 'userAgreement'

export interface SeoConfig {
  title: string
  description: string
  path: string
  keywords?: string
}

export const SEO_ROUTES: Record<SeoRouteKey, SeoConfig> = {
  home: {
    title: 'Make API - AI API Gateway and Model Routing Console',
    description:
      'Make API provides an OpenAI-compatible AI API gateway for model routing, pricing visibility, usage analytics, and private deployment management.',
    path: '/',
    keywords:
      'AI API gateway, OpenAI compatible API, model routing, API relay, LLM gateway',
  },
  pricing: {
    title: 'AI Model Pricing - Make API',
    description:
      'Compare enabled AI models, providers, endpoint capabilities, and token pricing in one searchable model directory.',
    path: '/pricing',
    keywords:
      'AI model pricing, LLM pricing, token pricing, OpenAI compatible models, model directory',
  },
  rankings: {
    title: 'AI Model Rankings - Make API',
    description:
      'Track AI model usage trends, provider market share, and model momentum across your Make API deployment.',
    path: '/rankings',
    keywords:
      'AI model rankings, LLM leaderboard, model usage trends, provider market share',
  },
  about: {
    title: 'About Make API',
    description:
      'Learn about Make API, a private AI API gateway and orchestration console for unified model access.',
    path: '/about',
    keywords:
      'about Make API, AI gateway platform, private AI API console, model orchestration',
  },
  privacyPolicy: {
    title: 'Privacy Policy - Make API',
    description:
      'Review the Make API privacy policy for data handling, account information, and platform usage practices.',
    path: '/privacy-policy',
  },
  userAgreement: {
    title: 'User Agreement - Make API',
    description:
      'Read the Make API user agreement covering platform access, account responsibilities, and acceptable use.',
    path: '/user-agreement',
  },
}

export function getAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
