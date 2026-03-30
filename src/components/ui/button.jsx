import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(231,48,91,0.25)]',
        secondary:
          'bg-white/70 text-foreground ring-1 ring-border backdrop-blur hover:bg-white dark:bg-white/10 dark:hover:bg-white/15',
        ghost:
          'text-foreground hover:bg-white/60 dark:hover:bg-white/10',
        danger:
          'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-glow hover:-translate-y-0.5',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-7 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button }
