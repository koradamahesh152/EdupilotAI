import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import { BarChart3, Clock, TrendingUp, Target, Flame, Award, Zap } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans, useCompletions, useAchievements, useTopics } from '@/hooks/useData';
import { pct, xpProgress, formatTime } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const COLORS = ['#3380ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsPage() {
  const { profile } = useAuth();
  const { plans } = usePlans();
  const { completions } = useCompletions();
  const { achievements } = useAchievements();
  const { theme } = useTheme();
  const activePlan = plans.find((p) => p.status === 'active') ?? plans[0] ?? null;
  const { topics } = useTopics(activePlan?.id ?? null);

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  // Weekly study hours (last 14 days)
  const last14 = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split('T')[0];
      const minutes = completions.filter((c) => c.study_date === dateStr).reduce((s, c) => s + c.minutes_studied, 0);
      return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), hours: +(minutes / 60).toFixed(2), minutes };
    });
  }, [completions]);

  // Monthly progress (per plan)
  const planProgress = useMemo(() => {
    return plans.map((p) => ({
      name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title,
      completed: p.completed_topics,
      remaining: p.total_topics - p.completed_topics,
      pct: pct(p.completed_topics, p.total_topics),
    }));
  }, [plans]);

  // Topic completion by difficulty
  const difficultyBreakdown = useMemo(() => {
    const groups = { beginner: 0, intermediate: 0, advanced: 0 };
    for (const t of topics) {
      if (t.status === 'completed') groups[t.difficulty]++;
    }
    return [
      { name: 'Beginner', value: groups.beginner, color: '#10b981' },
      { name: 'Intermediate', value: groups.intermediate, color: '#f59e0b' },
      { name: 'Advanced', value: groups.advanced, color: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [topics]);

  // Skill progress (radial)
  const skillData = useMemo(() => {
    const overall = activePlan ? pct(activePlan.completed_topics, activePlan.total_topics) : 0;
    return [{ name: 'Overall', value: overall, fill: '#3380ff' }];
  }, [activePlan]);

  const totalHours = completions.reduce((s, c) => s + c.minutes_studied, 0) / 60;
  const totalTopics = topics.filter((t) => t.status === 'completed').length;
  const xp = xpProgress(profile?.xp ?? 0);
  const consistency = completions.length > 0
    ? Math.round((completions.length / Math.max(1, Math.ceil((Date.now() - new Date(completions[0]?.study_date ?? Date.now()).getTime()) / 86400000))) * 100)
    : 0;

  if (plans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <EmptyState
            icon={<BarChart3 className="w-7 h-7" />}
            title="No analytics yet"
            description="Create a learning plan and start completing topics to see your progress analytics here."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your learning progress and consistency</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Total Study Hours', value: `${totalHours.toFixed(1)}h`, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { icon: Target, label: 'Topics Completed', value: `${totalTopics}`, color: 'text-accent-500', bg: 'bg-accent-500/10' },
          { icon: Flame, label: 'Current Streak', value: `${profile?.streak ?? 0} days`, color: 'text-warning-500', bg: 'bg-warning-500/10' },
          { icon: Zap, label: 'Total XP', value: `${profile?.xp ?? 0}`, color: 'text-brand-500', bg: 'bg-brand-500/10' },
        ].map((s, i) => (
          <Card key={i} delay={i * 0.05}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="font-display font-bold text-lg">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours */}
        <Card delay={0.1}>
          <CardHeader title="Study Hours" subtitle="Last 14 days" icon={<Clock className="w-5 h-5" />} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={last14}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3380ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3380ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} />
              <Tooltip
                contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 12, fontSize: 12 }}
                formatter={(v) => [`${v}h`, 'Study hours']}
              />
              <Area type="monotone" dataKey="hours" stroke="#3380ff" strokeWidth={2} fill="url(#hoursGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Plan Progress */}
        <Card delay={0.15}>
          <CardHeader title="Plan Progress" subtitle="Completed vs remaining topics" icon={<Target className="w-5 h-5" />} />
          {planProgress.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-16">No plans to show</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={planProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: axisColor }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: axisColor }} width={100} />
                <Tooltip
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="remaining" stackId="a" fill={isDark ? '#334155' : '#cbd5e1'} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Difficulty Breakdown */}
        <Card delay={0.2}>
          <CardHeader title="Topic Completion" subtitle="By difficulty level" icon={<TrendingUp className="w-5 h-5" />} />
          {difficultyBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-16">Complete topics to see breakdown</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={difficultyBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {difficultyBreakdown.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {difficultyBreakdown.length > 0 && (
            <div className="flex justify-center gap-4 mt-2">
              {difficultyBreakdown.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Skill Progress Radial */}
        <Card delay={0.25}>
          <CardHeader title="Skill Progress" subtitle={activePlan?.title ?? 'No active plan'} icon={<Award className="w-5 h-5" />} />
          <div className="flex flex-col items-center gap-4 py-4">
            <ProgressRing value={activePlan ? pct(activePlan.completed_topics, activePlan.total_topics) : 0} size={160} label="overall" />
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Current Level</p>
                <p className="font-display font-bold text-lg">{profile?.level ?? 1}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Consistency</p>
                <p className="font-display font-bold text-lg">{consistency}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Forecast */}
      <Card delay={0.3}>
        <CardHeader title="Completion Forecast" subtitle="Projected completion dates for your plans" icon={<TrendingUp className="w-5 h-5" />} />
        <div className="space-y-3">
          {plans.map((p) => {
            const progress = pct(p.completed_topics, p.total_topics);
            const remaining = p.total_topics - p.completed_topics;
            const daysPerTopic = p.daily_study_time > 0 ? 45 / p.daily_study_time : 1;
            const estDays = Math.ceil(remaining * daysPerTopic);
            const estDate = new Date();
            estDate.setDate(estDate.getDate() + estDays);
            return (
              <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{p.title}</span>
                  <Badge variant={progress >= 100 ? 'success' : 'info'}>{progress}%</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{remaining} topics remaining</span>
                  <span>Est. completion: {estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
