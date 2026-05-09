import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
}: StepNavigationProps) {
  const { t } = useTranslation()
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='text-muted-foreground order-2 text-xs font-medium sm:order-1'>
        {currentStep + 1}/{totalSteps}
      </div>

      <div className='order-1 flex w-full gap-2 sm:order-2 sm:w-auto'>
        {!isFirstStep && (
          <Button
            type='button'
            variant='outline'
            onClick={onBack}
            className='flex-1 sm:flex-none'
          >
            <ArrowLeft className='mr-2 size-4' />
            {t('Back')}
          </Button>
        )}

        {!isLastStep && (
          <Button type='button' onClick={onNext} className='flex-1 sm:flex-none'>
            {t('Next')}
            <ArrowRight className='ml-2 size-4' />
          </Button>
        )}

        {isLastStep && (
          <Button
            type='button'
            onClick={onSubmit}
            disabled={isSubmitting}
            className='from-primary to-primary/80 flex-1 bg-gradient-to-r shadow-sm sm:flex-none'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                {t('Initializing...')}
              </>
            ) : (
              <>
                <CheckCircle2 className='mr-2 size-4' />
                {t('Initialize system')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
