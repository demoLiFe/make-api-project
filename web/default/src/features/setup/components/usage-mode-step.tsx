import type { ComponentType } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Building2, Presentation } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { SetupFormValues, SetupUsageMode } from '../types'

interface UsageModeStepProps {
  form: UseFormReturn<SetupFormValues>
}

const USAGE_MODE_OPTIONS: Array<{
  value: SetupUsageMode
  titleKey: string
  descriptionKey: string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    value: 'external',
    titleKey: 'External operations',
    descriptionKey:
      'Serve multiple users or teams with billing and quota control.',
    icon: Building2,
  },
  {
    value: 'demo',
    titleKey: 'Demo site',
    descriptionKey:
      'Showcase core capabilities with demo credentials and limited access.',
    icon: Presentation,
  },
]

export function UsageModeStep({ form }: UsageModeStepProps) {
  const { t } = useTranslation()

  return (
    <FormField
      control={form.control}
      name='usageMode'
      render={({ field }) => (
        <FormItem className='space-y-4'>
          <div className='space-y-1'>
            <FormLabel>{t('How will you use the platform?')}</FormLabel>
            <p className='text-muted-foreground text-sm'>
              {t('Choose how the platform will operate')}
            </p>
          </div>

          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={(value) => {
                form.clearErrors('usageMode')
                field.onChange(value as SetupUsageMode)
              }}
              className='grid gap-3 md:grid-cols-2'
            >
              {USAGE_MODE_OPTIONS.map(
                ({ value, titleKey, descriptionKey, icon: Icon }) => (
                  <Label
                    key={value}
                    htmlFor={`usage-mode-${value}`}
                    className={cn(
                      'group bg-background/80 hover:border-primary/40 focus-within:border-primary/50 has-data-[checked]:border-primary has-data-[checked]:bg-primary/5 has-data-[checked]:ring-primary/15 flex cursor-pointer flex-col gap-4 rounded-2xl border p-5 font-normal transition-all has-data-[checked]:ring-2'
                    )}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='bg-muted group-has-data-[checked]:bg-primary group-has-data-[checked]:text-primary-foreground text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-2xl transition'>
                        <Icon className='size-5' />
                      </div>
                      <RadioGroupItem
                        id={`usage-mode-${value}`}
                        value={value}
                        className='mt-1'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label
                        htmlFor={`usage-mode-${value}`}
                        className='text-base leading-none font-semibold'
                      >
                        {t(titleKey)}
                      </Label>
                      <p className='text-muted-foreground text-sm leading-6'>
                        {t(descriptionKey)}
                      </p>
                    </div>
                  </Label>
                )
              )}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
