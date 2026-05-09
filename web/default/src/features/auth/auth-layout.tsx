import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Skeleton } from '@/components/ui/skeleton'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()
  const displayName = systemName || 'New API'

  return (
    <div className='from-background via-slate-950/5 to-background relative grid h-svh max-w-none overflow-hidden bg-gradient-to-br dark:via-cyan-950/10'>
      <div className='pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px)] [background-size:44px_44px]' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(34,197,94,0.10),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_28%)]' />
      <Link
        to='/'
        className='absolute top-4 left-4 z-10 flex items-center gap-3 transition-opacity hover:opacity-80 sm:top-8 sm:left-8'
      >
        <div className='relative flex h-11 w-11 items-center justify-center'>
          <div className='absolute inset-0 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.12)]' />
          {loading ? (
            <Skeleton className='absolute inset-[6px] rounded-xl' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='relative z-10 h-7 w-7 rounded-xl object-cover'
            />
          )}
        </div>
        <div className='space-y-0.5'>
          {loading ? (
            <Skeleton className='h-6 w-24' />
          ) : (
            <h1 className='text-xl font-semibold tracking-tight'>{displayName}</h1>
          )}
        </div>
      </Link>
      <div className='container flex items-center pt-16 sm:pt-0'>
        <div className='bg-card/86 border-cyan-500/15 mx-auto flex w-full flex-col justify-center space-y-2 rounded-3xl border px-4 py-8 shadow-[0_24px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:w-[480px] sm:p-8'>
          {children}
        </div>
      </div>
    </div>
  )
}
