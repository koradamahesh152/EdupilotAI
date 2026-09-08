import { GraduationCap, Sparkles, Target, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl gradient-text">EduPilot AI</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your personal learning coach</p>
            </div>
          </div>

          <h2 className="font-display font-bold text-4xl text-slate-900 dark:text-slate-100 leading-tight mb-4">
            Achieve any learning goal with an AI mentor by your side.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-md">
            Personalized roadmaps, daily missions, progress tracking, and AI guidance — all in one place.
          </p>

          <div className="space-y-4 max-w-sm">
            {[
              { icon: Sparkles, text: 'AI-generated learning roadmaps tailored to you' },
              { icon: Target, text: 'Daily missions that keep you focused and consistent' },
              { icon: TrendingUp, text: 'Beautiful analytics to track your progress' },
              { icon: Award, text: 'Gamification with XP, levels, and achievements' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-brand-500">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="text-slate-700 dark:text-slate-300">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl gradient-text">EduPilot AI</h1>
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100 mb-1">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
