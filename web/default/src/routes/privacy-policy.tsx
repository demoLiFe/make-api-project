import { createFileRoute } from '@tanstack/react-router'
import { Seo } from '@/components/seo'
import { PrivacyPolicy } from '@/features/legal'
import { SEO_ROUTES } from '@/lib/seo'

function PrivacyPolicyRoute() {
  return (
    <>
      <Seo {...SEO_ROUTES.privacyPolicy} />
      <PrivacyPolicy />
    </>
  )
}

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyRoute,
})
