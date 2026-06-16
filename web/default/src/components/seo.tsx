import { useEffect } from 'react'
import { useSystemConfigStore } from '@/stores/system-config-store'
import { getAbsoluteUrl, SEO_DEFAULTS, type SeoConfig } from '@/lib/seo'

interface SeoProps extends SeoConfig {
  image?: string
  noIndex?: boolean
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    const name = attributes.name
    const property = attributes.property

    if (name) element.setAttribute('name', name)
    if (property) element.setAttribute('property', property)

    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector(
    `link[rel="${rel}"]`
  ) as HTMLLinkElement | null

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export function Seo(props: SeoProps) {
  const systemName = useSystemConfigStore((state) => state.config.systemName)
  const logo = useSystemConfigStore((state) => state.config.logo)

  useEffect(() => {
    const siteName = systemName || SEO_DEFAULTS.siteName
    const title = props.title.replace(/Make API/g, siteName)
    const description = props.description
    const canonical = getAbsoluteUrl(props.path)
    const image = getAbsoluteUrl(props.image || logo || SEO_DEFAULTS.image)

    document.documentElement.dataset.seoManaged = 'true'
    document.title = title
    document.documentElement.setAttribute('lang', 'zh-CN')

    setMeta('meta[name="title"]', { name: 'title', content: title })
    setMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    })
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: props.noIndex ? 'noindex,nofollow' : 'index,follow',
    })

    if (props.keywords) {
      setMeta('meta[name="keywords"]', {
        name: 'keywords',
        content: props.keywords,
      })
    }

    setLink('canonical', canonical)

    setMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: SEO_DEFAULTS.type,
    })
    setMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: siteName,
    })
    setMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: title,
    })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    setMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonical,
    })
    setMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: image,
    })
    setMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: SEO_DEFAULTS.locale,
    })

    setMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    setMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: title,
    })
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })
    setMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: image,
    })
  }, [
    logo,
    props.description,
    props.image,
    props.keywords,
    props.noIndex,
    props.path,
    props.title,
    systemName,
  ])

  return null
}
