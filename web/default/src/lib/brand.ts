export const BRAND_NAME = 'Make API'
export const BRAND_TAGLINE = ''
export const BRAND_LOGO_PATH = '/make-api-mark.svg'

export function resolveBrandName(systemName?: string | null): string {
  const trimmed = systemName?.trim()

  if (!trimmed) return BRAND_NAME

  return trimmed
}

export function resolveBrandLogo(logo?: string | null): string {
  const trimmed = logo?.trim()

  if (!trimmed) return BRAND_LOGO_PATH

  return trimmed
}
