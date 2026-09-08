import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function ProgressRing({ value, size = 120, strokeWidth = 10, className, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-slate-200 dark:stroke-slate-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="url(#progressGrad)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3380ff" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">{Math.round(value)}%</span>
        {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  className?: string;
  gradient?: boolean;
}

export function ProgressBar({ value, className, gradient = true }: ProgressBarProps) {
  return (
    <div className={cn('w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', gradient ? 'bg-gradient-to-r from-brand-500 to-accent-500' : 'bg-brand-500')}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
