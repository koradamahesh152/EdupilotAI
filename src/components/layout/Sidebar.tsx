import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Map,
  CheckSquare,
  BarChart3,
  MessageSquare,
  BookOpen,
  Award,
  User,
  Settings,
  GraduationCap,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/plans', label: 'Learning Plans', icon: Target },
  { to: '/app/roadmap', label: 'Roadmaps', icon: Map },
  { to: '/app/mission', label: "Today's Mission", icon: CheckSquare },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/mentor', label: 'AI Mentor', icon: MessageSquare },
  { to: '/app/resources', label: 'Resources', icon: BookOpen },
  { to: '/app/achievements', label: 'Achievements', icon: Award },
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 transition-transform duration-300',
          'glass border-r border-slate-200/60 dark:border-slate-800/60',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-md shadow-brand-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-none gradient-text">EduPilot</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">AI Learning Coach</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 overflow-y-auto scrollbar-thin h-[calc(100vh-4rem)]">
          {navItems.map((item, i) => (
            <motion.div key={item.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/10 to-accent-500/10 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60',
                  )
                }
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>
      </aside>
    </>
  );
}
