import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    success: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-400',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400',
    error: 'bg-error-100 text-error-600 dark:bg-error-500/15 dark:text-error-400',
    info: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400',
    brand: 'bg-gradient-to-r from-brand-500 to-accent-500 text-white',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
