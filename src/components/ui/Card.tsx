// 🃏 Card component — incident.io style clean white card
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-200 bg-white shadow-card",
        hover &&
          "transition-all duration-200 hover:border-surface-300 hover:shadow-card-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-surface-100", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardHeaderProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-t border-surface-100", className)}>
      {children}
    </div>
  );
}
