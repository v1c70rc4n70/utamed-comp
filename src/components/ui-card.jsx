import { cn } from '../lib/utils'

export function Card({ className, children }) {
  return <section className={cn('rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/20', className)}>{children}</section>
}
