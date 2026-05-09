import type { UseFormReturn } from 'react-hook-form'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import type { SetupFormValues } from '../types'

interface AdminStepProps {
  form: UseFormReturn<SetupFormValues>
  rootInitialized?: boolean
}

export function AdminStep({ form, rootInitialized }: AdminStepProps) {
  const { t } = useTranslation()

  if (rootInitialized) {
    return (
      <Alert className='border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/40'>
        <AlertDescription className='flex items-start gap-3'>
          <ShieldCheck className='mt-0.5 size-4 shrink-0 text-sky-500' />
          {t(
            'The administrator account is already initialized. You can keep your existing credentials and continue to the next step.'
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='from-primary/10 to-background rounded-2xl border p-5'>
        <div className='flex items-start gap-3'>
          <div className='bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl'>
            <KeyRound className='size-5' />
          </div>
          <div className='space-y-1'>
            <h3 className='text-base font-semibold'>
              {t('Administrator account')}
            </h3>
            <p className='text-muted-foreground text-sm leading-6'>
              {t('Create credentials for the root user')}
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Administrator username')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('Choose a username')}
                  autoComplete='username'
                  className='bg-background/80 h-11 rounded-xl'
                  onChange={(event) => {
                    form.clearErrors('username')
                    field.onChange(event)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder={t('Set a secure password (min. 8 characters)')}
                  autoComplete='new-password'
                  className='bg-background/80 h-11 rounded-xl'
                  onChange={(event) => {
                    form.clearErrors('password')
                    field.onChange(event)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem className='sm:col-span-2'>
              <FormLabel>{t('Confirm password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder={t('Repeat the administrator password')}
                  autoComplete='new-password'
                  className='bg-background/80 h-11 rounded-xl'
                  onChange={(event) => {
                    form.clearErrors('confirmPassword')
                    field.onChange(event)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
