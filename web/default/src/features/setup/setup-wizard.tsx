import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  CheckCheck,
  Database,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'
import { ErrorState } from '@/components/error-state'
import { LanguageSwitcher } from '@/components/language-switcher'
import { LoadingState } from '@/components/loading-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { buildSetupPayload, getSetupStatus, submitSetup } from './api'
import { AdminStep } from './components/admin-step'
import { CompleteStep } from './components/complete-step'
import { DatabaseStep } from './components/database-step'
import { StepNavigation } from './components/step-navigation'
import { UsageModeStep } from './components/usage-mode-step'
import type { SetupFormValues, SetupStatus } from './types'

const STEPS = [
  {
    titleKey: 'Database check',
    descriptionKey: 'Verify your database connection',
    icon: Database,
  },
  {
    titleKey: 'Administrator account',
    descriptionKey: 'Create credentials for the root user',
    icon: ShieldCheck,
  },
  {
    titleKey: 'Usage mode',
    descriptionKey: 'Choose how the platform will operate',
    icon: Waypoints,
  },
  {
    titleKey: 'Review & initialize',
    descriptionKey: 'Confirm settings and finish setup',
    icon: CheckCheck,
  },
] as const

const DEFAULT_FORM_VALUES: SetupFormValues = {
  username: '',
  password: '',
  confirmPassword: '',
  usageMode: 'external',
}

export function SetupWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { systemName, logo, loading: systemConfigLoading } = useSystemConfig()
  const displaySystemName = systemName || 'New API'

  const [currentStep, setCurrentStep] = useState(0)
  const [setupStatus, setSetupStatus] = useState<SetupStatus | undefined>()

  const form = useForm<SetupFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onBlur',
  })

  const watchedValues = form.watch()
  const progressValue = ((currentStep + 1) / STEPS.length) * 100

  const {
    data: statusResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['setup-status'],
    queryFn: getSetupStatus,
    retry: false,
  })

  const mutation = useMutation({
    mutationKey: ['setup-submit'],
    mutationFn: submitSetup,
    onSuccess: async (response) => {
      if (response.success) {
        toast.success(t('System initialized successfully! Redirecting...'))
        await queryClient.invalidateQueries({ queryKey: ['setup-status'] })
        setTimeout(() => {
          navigate({ to: '/' })
        }, 1200)
      } else {
        toast.error(
          response.message || t('Initialization failed, please try again.')
        )
      }
    },
    onError: () => {
      toast.error(t('Failed to initialize system'))
    },
  })

  useEffect(() => {
    if (!statusResponse) return

    if (!statusResponse.success) {
      toast.error(statusResponse.message || t('Failed to load setup status'))
      return
    }

    const status = statusResponse.data
    if (!status) return

    if (status.status) {
      navigate({ to: '/' })
      return
    }

    setSetupStatus(status)
    setCurrentStep(0)

    if (status.DemoSiteEnabled) {
      form.setValue('usageMode', 'demo', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    } else {
      form.setValue('usageMode', 'external', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse, navigate, form])

  useEffect(() => {
    if (!setupStatus?.root_init) return

    form.setValue('username', '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    })
    form.setValue('password', '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    })
    form.setValue('confirmPassword', '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    })
  }, [setupStatus, form])

  const currentStepComponent = useMemo(() => {
    if (currentStep === 0) {
      return <DatabaseStep status={setupStatus} />
    }

    if (currentStep === 1) {
      return (
        <AdminStep
          form={form}
          rootInitialized={Boolean(setupStatus?.root_init)}
        />
      )
    }

    if (currentStep === 2) {
      return <UsageModeStep form={form} />
    }

    return <CompleteStep status={setupStatus} values={watchedValues} />
  }, [currentStep, form, setupStatus, watchedValues])

  const validateAdminStep = () => {
    if (setupStatus?.root_init) return true

    const username = form.getValues('username')?.trim()
    const password = form.getValues('password')?.trim()
    const confirmPassword = form.getValues('confirmPassword')?.trim()

    if (!username) {
      form.setError('username', {
        type: 'manual',
        message: t('Please enter an administrator username'),
      })
      toast.error(t('Please enter an administrator username'))
      return false
    }

    if (!password || password.length < 8) {
      form.setError('password', {
        type: 'manual',
        message: t('Password must be at least 8 characters long'),
      })
      toast.error(t('Password must be at least 8 characters long'))
      return false
    }

    if (password !== confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: t('Passwords do not match'),
      })
      toast.error(t('Passwords do not match'))
      return false
    }

    return true
  }

  const validateUsageModeStep = () => {
    const usageMode = form.getValues('usageMode')

    if (!usageMode) {
      form.setError('usageMode', {
        type: 'manual',
        message: t('Select a usage mode to continue'),
      })
      toast.error(t('Select a usage mode to continue'))
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !validateAdminStep()) return
    if (currentStep === 2 && !validateUsageModeStep()) return

    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1))
  }

  const handlePreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  const handleSubmit = () => {
    const adminValid = validateAdminStep()
    const usageValid = validateUsageModeStep()

    if (!adminValid || !usageValid) return

    const payload = buildSetupPayload(
      form.getValues(),
      Boolean(setupStatus?.root_init)
    )

    mutation.mutate(payload)
  }

  return (
    <div className='from-background via-slate-950/5 to-background relative min-h-svh overflow-hidden bg-gradient-to-br py-8 sm:py-10 dark:via-cyan-950/10'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px)] [background-size:44px_44px]' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(34,197,94,0.10),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_28%)]' />
        <div className='absolute top-8 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent' />
        <div className='bg-primary/15 absolute top-[-8rem] left-[-5rem] h-56 w-56 rounded-full blur-3xl' />
        <div className='bg-emerald-500/10 absolute top-1/3 right-[-6rem] h-72 w-72 rounded-full blur-3xl' />
        <div className='bg-sky-500/10 absolute bottom-[-8rem] left-1/3 h-64 w-64 rounded-full blur-3xl' />
        <div className='absolute right-12 bottom-16 h-40 w-40 rounded-full border border-cyan-400/10' />
      </div>

      <div className='absolute top-4 right-4 z-10 sm:top-6 sm:right-6'>
        <LanguageSwitcher />
      </div>

      <div className='relative z-10 container mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start'>
          <Card className='border-cyan-500/15 bg-card/82 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:shadow-[0_24px_90px_rgba(8,145,178,0.12)]'>
            <CardHeader className='space-y-5'>
              <div className='space-y-4'>
                <div className='bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border border-cyan-400/15 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.22em] uppercase'>
                  <Sparkles className='size-3.5' />
                  {t('System setup wizard')}
                </div>

                <div className='flex items-center gap-3'>
                  <div className='relative flex h-18 w-18 shrink-0 items-center justify-center'>
                    <div className='absolute inset-0 rounded-[1.4rem] border border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.12)]' />
                    <div className='absolute inset-[6px] rounded-[1rem] border border-cyan-400/10' />
                    <div className='absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-cyan-400/70' />
                    {systemConfigLoading ? (
                      <Skeleton className='absolute inset-[10px] rounded-2xl' />
                    ) : (
                      <img
                        src={logo}
                        alt={t('System logo')}
                        className='relative z-10 h-12 w-12 rounded-2xl object-cover shadow-sm'
                      />
                    )}
                  </div>

                  <div className='min-w-0 space-y-1'>
                    {systemConfigLoading ? (
                      <Skeleton className='h-7 w-40' />
                    ) : (
                      <h1 className='text-2xl font-semibold tracking-tight text-balance sm:text-3xl'>
                        {t('Initialize')} {displaySystemName}
                      </h1>
                    )}
                    <p className='text-muted-foreground text-sm leading-6'>
                      {t(
                        'Follow the guided steps to prepare your workspace before the first login.'
                      )}
                    </p>
                    <div className='text-muted-foreground/80 flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase'>
                      <span className='inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]' />
                      {t('Secure bootstrap sequence')}
                    </div>
                  </div>
                </div>
              </div>

              <div className='from-primary/12 via-primary/6 to-background rounded-2xl border border-cyan-500/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                  <div className='space-y-1'>
                    <p className='font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-cyan-500/80'>
                      {t('Active checkpoint')}
                    </p>
                    <p className='text-sm font-medium'>
                      {t(STEPS[currentStep].titleKey)}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {t(STEPS[currentStep].descriptionKey)}
                    </p>
                  </div>

                  <div className='text-primary bg-background/80 rounded-full border border-cyan-500/10 px-3 py-1 font-mono text-[11px] font-semibold shadow-sm'>
                    {currentStep + 1}/{STEPS.length}
                  </div>
                </div>

                <div className='bg-muted h-2 overflow-hidden rounded-full'>
                  <div
                    className='from-primary to-primary/70 h-full rounded-full bg-gradient-to-r transition-all duration-500'
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className='space-y-3'>
              <ol className='space-y-3'>
                {STEPS.map((step, index) => {
                  const isActive = currentStep === index
                  const isCompleted = currentStep > index
                  const StepIcon = step.icon

                  return (
                    <li
                      key={step.titleKey}
                      className={cn(
                        'rounded-2xl border p-4 transition-all duration-300',
                        isActive
                          ? 'border-cyan-400/30 bg-cyan-400/8 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_14px_40px_rgba(34,211,238,0.08)] ring-2 ring-cyan-400/15'
                          : isCompleted
                            ? 'border-primary/20 bg-primary/5'
                            : 'bg-background/70 border-border/60'
                      )}
                    >
                      <div className='flex items-start gap-3'>
                        <div
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-2xl border',
                            isActive || isCompleted
                              ? 'border-cyan-400/25 bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                              : 'text-muted-foreground bg-muted/70 border-border/60'
                          )}
                        >
                          {isCompleted ? (
                            <CheckCheck className='size-4' />
                          ) : (
                            <StepIcon className='size-4' />
                          )}
                        </div>

                        <div className='min-w-0 space-y-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-muted-foreground font-mono text-[11px] font-medium tracking-[0.12em]'>
                              0{index + 1}
                            </span>
                            <p className='text-sm font-semibold'>
                              {t(step.titleKey)}
                            </p>
                          </div>
                          <p className='text-muted-foreground text-xs leading-5'>
                            {t(step.descriptionKey)}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>

          <Card className='border-cyan-500/15 bg-card/90 shadow-[0_24px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:shadow-[0_24px_90px_rgba(8,145,178,0.10)]'>
            <CardHeader className='space-y-2 border-b'>
              <div className='text-muted-foreground flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.18em] uppercase'>
                <span className='inline-block h-1.5 w-1.5 rounded-full bg-cyan-400' />
                {t('Initialization console')}
              </div>
              <CardTitle className='text-xl font-semibold'>
                {t(STEPS[currentStep].titleKey)}
              </CardTitle>
              <CardDescription>
                {t(STEPS[currentStep].descriptionKey)}
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6 py-6'>
              {isLoading ? (
                <LoadingState message={t('Loading setup status...')} />
              ) : isError ? (
                <ErrorState
                  title={t('We could not load the setup status.')}
                  onRetry={() => refetch()}
                />
              ) : (
                <Form {...form}>
                  <form
                    className='space-y-6'
                    onSubmit={(event) => event.preventDefault()}
                  >
                    {currentStepComponent}
                  </form>
                </Form>
              )}
            </CardContent>

            {!isLoading && !isError && (
              <CardFooter className='w-full justify-end border-t'>
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={STEPS.length}
                  onBack={handlePreviousStep}
                  onNext={handleNextStep}
                  onSubmit={handleSubmit}
                  isSubmitting={mutation.isPending}
                />
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
