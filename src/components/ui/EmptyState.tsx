import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 dark:text-brand-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
