import { cn } from '../../utils/cn'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/10', className)}
      {...props}
    />
  )
}
