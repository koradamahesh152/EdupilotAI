import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, Clock, Flame, Zap, Award, BookOpen, Camera, Edit2, Check, X } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans, useCompletions, useAchievements, useTopics } from '@/hooks/useData';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { xpProgress, formatTime, pct, levelFromXp } from '@/lib/utils';
import type { SkillLevel } from '@/lib/types';

export function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const { plans } = usePlans();
  const { completions } = useCompletions();
  const { achievements } = useAchievements();
  const activePlan = plans.find((p) => p.status === 'active') ?? plans[0] ?? null;
  const { topics } = useTopics(activePlan?.id ?? null);
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    college: profile?.college ?? '',
    branch: profile?.branch ?? '',
    year: profile?.year ?? '',
    skill_level: (profile?.skill_level ?? 'beginner') as SkillLevel,
    daily_study_time: profile?.daily_study_time ?? 60,
  });

  const xp = xpProgress(profile?.xp ?? 0);
  const totalHours = completions.reduce((s, c) => s + c.minutes_studied, 0) / 60;
  const totalTopicsCompleted = topics.filter((t) => t.status === 'completed').length;
  const completedPlans = plans.filter((p) => p.status === 'completed').length;

  const saveProfile = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        college: form.college,
        branch: form.branch,
        year: form.year,
        skill_level: form.skill_level,
        daily_study_time: form.daily_study_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Profile updated', 'success');
      await refreshProfile();
      setEditing(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Profile</h1>

      {/* Profile header */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-3xl font-display font-bold shadow-lg">
                {(profile.full_name ?? '?')[0]?.toUpperCase()}
              </div>
            )}
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-500 hover:text-brand-500">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-display font-bold text-xl">{profile.full_name ?? 'Learner'}</h2>
              <Badge variant="brand">Level {profile.level}</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="info"><GraduationCap className="w-3 h-3" /> {profile.college ?? 'No college'}</Badge>
              <Badge variant="default">{profile.branch ?? 'No branch'}</Badge>
              <Badge variant="default">{profile.year ?? 'No year'}</Badge>
              <Badge variant="success" className="capitalize">{profile.skill_level}</Badge>
            </div>
          </div>

          <Button variant={editing ? 'secondary' : 'outline'} onClick={() => setEditing(!editing)}>
            {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit</>}
          </Button>
        </div>
      </Card>

      {/* XP & Level */}
      <Card>
        <CardHeader title="Level & Experience" subtitle={`Level ${profile.level}`} icon={<Zap className="w-5 h-5" />} />
        <div className="flex items-center gap-6">
          <ProgressRing value={xp.pct} size={120} label={`Lvl ${profile.level}`} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-500 dark:text-slate-400">{xp.current} / {xp.needed} XP to next level</span>
                <span className="font-medium">{xp.pct}%</span>
              </div>
              <ProgressBar value={xp.pct} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <Flame className="w-4 h-4 text-warning-500 mx-auto mb-1" />
                <p className="font-display font-bold">{profile.streak}</p>
                <p className="text-xs text-slate-500">Streak</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <Zap className="w-4 h-4 text-brand-500 mx-auto mb-1" />
                <p className="font-display font-bold">{profile.xp}</p>
                <p className="text-xs text-slate-500">Total XP</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <Award className="w-4 h-4 text-accent-500 mx-auto mb-1" />
                <p className="font-display font-bold">{achievements.length}</p>
                <p className="text-xs text-slate-500">Badges</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Study Hours', value: `${totalHours.toFixed(1)}h` },
          { icon: BookOpen, label: 'Topics Done', value: `${totalTopicsCompleted}` },
          { icon: Award, label: 'Plans Completed', value: `${completedPlans}` },
          { icon: Flame, label: 'Best Streak', value: `${profile.streak} days` },
        ].map((s, i) => (
          <Card key={i} delay={i * 0.05}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="font-display font-bold">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader title="Edit Profile" icon={<User className="w-5 h-5" />} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">College</label>
                  <input
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Branch</label>
                  <input
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
                  <input
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Skill Level</label>
                  <select
                    value={form.skill_level}
                    onChange={(e) => setForm({ ...form, skill_level: e.target.value as SkillLevel })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm capitalize"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Daily Study Time</label>
                  <select
                    value={form.daily_study_time}
                    onChange={(e) => setForm({ ...form, daily_study_time: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
                  >
                    {[30, 60, 120, 180, 240].map((t) => (
                      <option key={t} value={t}>{formatTime(t)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={saveProfile} className="w-full sm:w-auto">
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Learning plans summary */}
      <Card>
        <CardHeader title="Learning Goals" subtitle={`${plans.length} active plans`} icon={<BookOpen className="w-5 h-5" />} />
        <div className="space-y-3">
          {plans.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{p.title}</span>
                <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>
              </div>
              <ProgressBar value={pct(p.completed_topics, p.total_topics)} />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.completed_topics} / {p.total_topics} topics · {pct(p.completed_topics, p.total_topics)}%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
