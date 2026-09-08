import { useState } from 'react';
import { Settings, Moon, Sun, Bell, User, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE' || !user) return;
    // Delete profile and all related data (cascades to plans, topics, etc.)
    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    // Delete auth user via signOut (cannot delete auth user from client; just sign out)
    await signOut();
    toast('Account data deleted', 'success');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your preferences and account</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" subtitle="Customize how EduPilot looks" icon={<Settings className="w-5 h-5" />} />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-500" /> : <Sun className="w-5 h-5 text-warning-500" />}
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                theme === 'dark' ? 'bg-brand-500' : 'bg-slate-300',
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5',
              )} />
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Notifications" subtitle="Manage your reminders" icon={<Bell className="w-5 h-5" />} />
        <div className="space-y-3">
          {[
            { label: 'Daily Mission Reminder', desc: 'Get notified when your mission is ready' },
            { label: 'Streak Reminder', desc: 'Remind me to keep my streak alive' },
            { label: 'Achievement Notifications', desc: 'Celebrate when you unlock badges' },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-medium text-sm">{n.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{n.desc}</p>
              </div>
              <div className="relative w-12 h-6 rounded-full bg-brand-500">
                <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-md" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader title="Account" subtitle="Manage your account" icon={<User className="w-5 h-5" />} />
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-error-200 dark:border-error-900/50">
        <CardHeader title="Danger Zone" subtitle="Irreversible actions" icon={<AlertTriangle className="w-5 h-5 text-error-500" />} />
        <Button variant="danger" onClick={() => setShowDelete(true)} className="w-full">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </Button>
      </Card>

      {/* Delete confirmation */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will permanently delete all your learning plans, progress, achievements, and chat history. This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Type <span className="font-bold text-error-500">DELETE</span> to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-error-500/40 text-sm"
              placeholder="DELETE"
            />
          </div>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'} className="w-full">
            <Trash2 className="w-4 h-4" />
            Permanently Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
