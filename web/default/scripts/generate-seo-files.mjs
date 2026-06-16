import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const siteUrl = (
  process.env.VITE_SITE_URL ||
  process.env.FRONTEND_BASE_URL ||
  'https://api.make1688.com'
).replace(/\/+$/, '')

const publicDir = resolve('public')
const today = new Date().toISOString().slice(0, 10)

const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/pricing', changefreq: 'daily', priority: '0.9' },
  { path: '/rankings', changefreq: 'daily', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/user-agreement', changefreq: 'yearly', priority: '0.3' },
]

const blockedPaths = [
  '/api/',
  '/mj/',
  '/pg/',
  '/setup/',
  '/sign-in',
  '/sign-up',
  '/reset',
  '/forgot-password',
  '/otp',
  '/oauth',
  '/dashboard',
  '/playground',
  '/keys',
  '/models',
  '/channels',
  '/users',
  '/wallet',
  '/usage-logs',
  '/subscriptions',
  '/redemption-codes',
  '/system-settings',
]

mkdirSync(publicDir, { recursive: true })

writeFileSync(
  resolve(publicDir, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    ...blockedPaths.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
)

writeFileSync(
  resolve(publicDir, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map(
      (route) => `  <url>
    <loc>${siteUrl}${route.path === '/' ? '/' : route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    ),
    '</urlset>',
    '',
  ].join('\n')
)
