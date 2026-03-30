import { cn } from '../../utils/cn'

const variants = {
  critical: 'bg-rose-500/15 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  low: 'bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  safe: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  info: 'bg-sky-500/15 text-sky-700 ring-sky-500/20 dark:text-sky-300',
}

export function Badge({ className, variant = 'info', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ring-inset',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
