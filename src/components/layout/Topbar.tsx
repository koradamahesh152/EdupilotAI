import { Menu, Moon, Sun, Bell, LogOut, Flame } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { xpProgress } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import type { Notification } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const xp = xpProgress(profile?.xp ?? 0);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications((data as Notification[]) ?? []));
  }, [profile]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass border-b border-slate-200/60 dark:border-slate-800/60 px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-500/10 text-warning-600 dark:text-warning-400">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">{profile?.streak ?? 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <span className="text-sm font-semibold">Lvl {profile?.level ?? 1}</span>
            <div className="w-16 h-1.5 rounded-full bg-brand-200 dark:bg-brand-900 overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${xp.pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif((s) => !s)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 glass-card shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-display font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brand-500 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500 text-center">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 border-b border-slate-100 dark:border-slate-800/50 ${!n.read ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''}`}>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                      {n.body && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate('/login'))}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
