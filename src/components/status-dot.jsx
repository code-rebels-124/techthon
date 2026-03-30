import { cn } from '../utils/cn'

const palette = {
  critical: 'bg-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.65)]',
  low: 'bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.55)]',
  safe: 'bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.55)]',
  info: 'bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.55)]',
}

export function StatusDot({ status = 'info' }) {
  return <span className={cn('inline-flex size-2.5 rounded-full', palette[status])} />
}
