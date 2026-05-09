import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 64 64'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('size-6', className)}
      fill='none'
      {...props}
    >
      <title>Make API</title>
      <defs>
        <linearGradient id='make-api-core' x1='10' y1='10' x2='54' y2='54'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.95' />
          <stop offset='50%' stopColor='currentColor' stopOpacity='0.78' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.5' />
        </linearGradient>
      </defs>

      <rect
        x='10'
        y='10'
        width='44'
        height='44'
        rx='14'
        stroke='url(#make-api-core)'
        strokeWidth='2.5'
      />
      <path
        d='M20 42V22h5.2l6.8 9.2 6.8-9.2H44v20h-4.8V29.6l-7.2 9.4-7.2-9.4V42H20Z'
        fill='currentColor'
      />
      <circle cx='16' cy='16' r='2.5' fill='currentColor' fillOpacity='0.72' />
      <circle cx='48' cy='16' r='2.5' fill='currentColor' fillOpacity='0.72' />
      <circle cx='16' cy='48' r='2.5' fill='currentColor' fillOpacity='0.72' />
      <circle cx='48' cy='48' r='2.5' fill='currentColor' fillOpacity='0.72' />
    </svg>
  )
}
