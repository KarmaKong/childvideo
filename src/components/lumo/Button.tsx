import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Base = ButtonHTMLAttributes<HTMLButtonElement>

interface BtnProps extends Base {
  icon?: ReactNode
  full?: boolean
  size?: 'md' | 'lg'
}

const sizeCls = { md: 'min-h-[48px] px-6 text-card', lg: 'min-h-[56px] px-7 text-card-lg' }

export function PrimaryButton({ icon, full, size = 'lg', className = '', children, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-pill bg-lumo-blue font-bold
        text-white shadow-md transition-transform duration-200 ease-lumo active:scale-[0.96]
        ${sizeCls[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

export function SecondaryButton({ icon, full, size = 'lg', className = '', children, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-pill bg-white font-bold
        text-lumo-cocoa shadow-sm ring-1 ring-black/[0.05] transition-transform duration-200 ease-lumo
        active:scale-[0.96] ${sizeCls[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

export function AmberButton({ icon, full, size = 'lg', className = '', children, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-pill bg-lumo-yellow font-bold
        text-lumo-cocoa shadow-md transition-transform duration-200 ease-lumo active:scale-[0.96]
        ${sizeCls[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

interface IconBtnProps extends Base {
  label: string
  size?: number
  tone?: 'default' | 'blue'
}

export function IconButton({ label, size = 48, tone = 'default', className = '', children, ...p }: IconBtnProps) {
  return (
    <button
      {...p}
      aria-label={label}
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-black/[0.05]
        transition-transform duration-200 ease-lumo active:scale-[0.92]
        ${tone === 'blue' ? 'bg-lumo-blue text-white' : 'bg-white text-lumo-cocoa'} ${className}`}
    >
      {children}
    </button>
  )
}
