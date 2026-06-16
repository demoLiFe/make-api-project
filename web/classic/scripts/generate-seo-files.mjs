import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=');
          return [line.slice(0, index), line.slice(index + 1)];
        }),
    );
  } catch {
    return {};
  }
}

const env = readEnvFile('.env.production');
const siteUrl = (
  process.env.VITE_SITE_URL ||
  process.env.FRONTEND_BASE_URL ||
  env.VITE_SITE_URL ||
  env.FRONTEND_BASE_URL ||
  'https://api.make1688.com'
).replace(/\/+$/, '');

const publicDir = resolve('public');
const today = new Date().toISOString().slice(0, 10);

const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/pricing', changefreq: 'daily', priority: '0.9' },
  { path: '/docs', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/user-agreement', changefreq: 'yearly', priority: '0.3' },
];

const blockedPaths = [
  '/api/',
  '/mj/',
  '/pg/',
  '/setup',
  '/login',
  '/register',
  '/reset',
  '/oauth',
  '/console',
  '/chat2link',
  '/user/reset',
];

mkdirSync(publicDir, { recursive: true });

writeFileSync(
  resolve(publicDir, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    ...blockedPaths.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n'),
);

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
  </url>`,
    ),
    '</urlset>',
    '',
  ].join('\n'),
);
