import { CheckCircle2, Database, ShieldCheck, Waypoints } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@/components/status-badge'
import type { SetupFormValues, SetupStatus } from '../types'

interface CompleteStepProps {
  status?: SetupStatus
  values: SetupFormValues
}

const USAGE_MODE_LABEL_KEYS: Record<SetupFormValues['usageMode'], string> = {
  external: 'External operations mode',
  demo: 'Demo site mode',
}

const DATABASE_VARIANT: Record<
  string,
  'info' | 'success' | 'warning' | 'neutral'
> = {
  sqlite: 'warning',
  mysql: 'success',
  postgres: 'success',
}

export function CompleteStep({ status, values }: CompleteStepProps) {
  const { t } = useTranslation()
  const usageLabelKey = USAGE_MODE_LABEL_KEYS[values.usageMode]
  const dbType = status?.database_type ?? 'Unknown'
  const databaseVariant = DATABASE_VARIANT[dbType.toLowerCase()] ?? 'neutral'

  return (
    <div className='space-y-6'>
      <div className='from-emerald-500/12 to-background rounded-2xl border p-5'>
        <div className='flex items-start gap-3'>
          <div className='bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 flex size-11 shrink-0 items-center justify-center rounded-2xl'>
            <CheckCircle2 className='size-5' />
          </div>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold tracking-tight'>
              {t('Ready to initialize')}
            </h2>
            <p className='text-muted-foreground max-w-2xl text-sm leading-6'>
              {t(
                'Double check the configuration below. Your system will be locked until initialization is complete.'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='bg-background/80 rounded-2xl border p-5'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='bg-primary/12 text-primary flex size-10 items-center justify-center rounded-2xl'>
              <Database className='size-4' />
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase'>
                {t('Database')}
              </p>
              <p className='text-sm font-semibold'>{dbType}</p>
            </div>
          </div>
          <StatusBadge
            label={dbType}
            variant={databaseVariant}
            copyable={false}
          />
        </div>

        <div className='bg-background/80 rounded-2xl border p-5'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='bg-primary/12 text-primary flex size-10 items-center justify-center rounded-2xl'>
              <ShieldCheck className='size-4' />
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase'>
                {t('Administrator account')}
              </p>
              <p className='text-sm font-semibold'>
                {status?.root_init
                  ? t('Existing account will be reused')
                  : values.username || t('Not set yet')}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-background/80 rounded-2xl border p-5'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='bg-primary/12 text-primary flex size-10 items-center justify-center rounded-2xl'>
              <Waypoints className='size-4' />
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase'>
                {t('Usage mode')}
              </p>
              <p className='text-sm font-semibold'>{t(usageLabelKey)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
