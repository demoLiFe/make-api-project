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
    title: 'Make API - 统一大模型接口网关与 AI API 聚合平台',
    description:
      'Make API 提供稳定的大模型接口网关服务，支持 OpenAI、Claude、Gemini 等模型接口统一接入，适合 AI 应用开发、企业集成和私有化部署。',
    path: '/',
    keywords:
      '大模型接口网关,AI API,OpenAI API,Claude API,Gemini API,API中转,模型路由,AI接口聚合,私有化部署',
  },
  pricing: {
    title: 'AI 模型价格 - Make API',
    description:
      '查看 Make API 支持的 AI 模型、服务商、接口能力和 Token 计费信息，快速比较 OpenAI、Claude、Gemini 等模型价格。',
    path: '/pricing',
    keywords:
      'AI模型价格,大模型价格,Token计费,OpenAI价格,Claude价格,Gemini价格,模型广场',
  },
  rankings: {
    title: 'AI 模型排行榜 - Make API',
    description:
      '查看 Make API 平台内的 AI 模型调用趋势、服务商占比和模型热度排行，了解大模型使用表现。',
    path: '/rankings',
    keywords:
      'AI模型排行榜,大模型排行,LLM排行榜,模型调用趋势,模型热度,服务商占比',
  },
  about: {
    title: '关于 Make API',
    description:
      '了解 Make API 的产品定位、核心能力和私有化部署场景，统一管理多家大模型接口与 API 调用。',
    path: '/about',
    keywords: '关于Make API,AI API网关,大模型接口平台,私有化AI平台,模型编排',
  },
  privacyPolicy: {
    title: '隐私政策 - Make API',
    description:
      '查看 Make API 隐私政策，了解账号信息、平台使用数据和相关信息的处理方式。',
    path: '/privacy-policy',
  },
  userAgreement: {
    title: '用户协议 - Make API',
    description:
      '阅读 Make API 用户协议，了解平台访问、账号责任、API 使用规范和服务条款。',
    path: '/user-agreement',
  },
}

export function getAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
