import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function Card({ children, className, hover = false, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn('glass-card p-5', hover && 'hover:shadow-lg transition-shadow', className)}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ title, subtitle, icon, action }: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">{icon}</div>}
        <div>
          <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
