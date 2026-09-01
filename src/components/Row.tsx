import type { ReactNode } from 'react'

export default function Row({
  title,
  icon,
  action,
  children,
}: {
  title: string
  icon?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center gap-2 px-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className="text-lg font-extrabold">{title}</h2>
        <div className="ml-auto">{action}</div>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  )
}
