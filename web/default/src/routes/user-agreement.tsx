import { createFileRoute } from '@tanstack/react-router'
import { Seo } from '@/components/seo'
import { UserAgreement } from '@/features/legal'
import { SEO_ROUTES } from '@/lib/seo'

function UserAgreementRoute() {
  return (
    <>
      <Seo {...SEO_ROUTES.userAgreement} />
      <UserAgreement />
    </>
  )
}

export const Route = createFileRoute('/user-agreement')({
  component: UserAgreementRoute,
})
