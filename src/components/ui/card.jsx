import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("glass-panel rounded-[28px]", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn("font-display text-lg font-bold tracking-tight text-strong", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}
