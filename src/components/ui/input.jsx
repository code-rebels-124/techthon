import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "glass-panel h-11 w-full rounded-2xl border-0 px-4 text-sm text-strong placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400",
        className,
      )}
      {...props}
    />
  );
}
