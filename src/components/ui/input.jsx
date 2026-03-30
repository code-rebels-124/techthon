import { cn } from '../../utils/cn'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary/40 dark:border-white/10 dark:bg-white/5',
        className,
      )}
      {...props}
    />
  )
}
