import { motion } from 'framer-motion';
import {
  Flame,
  Target,
  CheckSquare,
  Clock,
  TrendingUp,
  Award,
  Quote,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { ProgressRing, ProgressBar } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans, useTopics, useCompletions, useAchievements } from '@/hooks/useData';
import { pct, xpProgress, formatTime, formatDate } from '@/lib/utils';
import { dailyQuote } from '@/lib/ai';
import type { LearningPlan } from '@/lib/types';

export function DashboardPage() {
  const { profile } = useAuth();
  const { plans } = usePlans();
  const { completions } = useCompletions();
  const { achievements } = useAchievements();

  const activePlan = plans.find((p) => p.status === 'active') ?? plans[0] ?? null;
  const { topics } = useTopics(activePlan?.id ?? null);

  const todayTopics = topics.filter((t) => t.status === 'available' || t.status === 'in_progress').slice(0, 4);
  const completedToday = topics.filter((t) => t.status === 'completed' && t.completed_at && t.completed_at.startsWith(new Date().toISOString().split('T')[0]));
  const totalMinutesToday = todayTopics.reduce((s, t) => s + t.estimated_minutes, 0);

  const overallProgress = activePlan ? pct(activePlan.completed_topics, activePlan.total_topics) : 0;
  const xp = xpProgress(profile?.xp ?? 0);

  // Weekly study data (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayCompletions = completions.filter((c) => c.study_date === dateStr);
    const minutes = dayCompletions.reduce((s, c) => s + c.minutes_studied, 0);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), minutes };
  });
  const maxWeekly = Math.max(...last7.map((d) => d.minutes), 1);

  const totalStudyHours = completions.reduce((s, c) => s + c.minutes_studied, 0) / 60;
  const consistency = completions.length > 0 ? Math.round((completions.length / Math.max(1, Math.ceil((Date.now() - new Date(completions[0]?.study_date ?? Date.now()).getTime()) / 86400000))) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Learner'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{dailyQuote()}</p>
        </div>
        <Link to="/app/mission">
          <Button>
            <Zap className="w-4 h-4" />
            Start Today's Mission
          </Button>
        </Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Streak', value: `${profile?.streak ?? 0} days`, color: 'text-warning-500', bg: 'bg-warning-500/10' },
          { icon: Clock, label: 'Study Hours', value: `${totalStudyHours.toFixed(1)}h`, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { icon: Target, label: 'Active Plans', value: `${plans.filter((p) => p.status === 'active').length}`, color: 'text-accent-500', bg: 'bg-accent-500/10' },
          { icon: Award, label: 'Achievements', value: `${achievements.length}`, color: 'text-brand-500', bg: 'bg-brand-500/10' },
        ].map((stat, i) => (
          <Card key={i} delay={i * 0.05} hover>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Mission */}
        <Card className="lg:col-span-2" delay={0.1}>
          <CardHeader title="Today's Mission" subtitle={activePlan ? activePlan.title : 'No active plan'} icon={<CheckSquare className="w-5 h-5" />} />
          {todayTopics.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-7 h-7" />}
              title="No mission for today"
              description={activePlan ? "You've completed all available topics! Generate a new plan or wait for the next mission." : "Create a learning plan to get your daily missions."}
              action={
                <Link to="/app/plans">
                  <Button size="sm">
                    <Target className="w-4 h-4" />
                    {activePlan ? 'View Plans' : 'Create Plan'}
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {todayTopics.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${t.status === 'completed' ? 'bg-accent-500 border-accent-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {t.status === 'completed' && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(t.estimated_minutes)} · {t.difficulty}</p>
                  </div>
                  <Badge variant={t.difficulty === 'beginner' ? 'success' : t.difficulty === 'intermediate' ? 'warning' : 'error'}>
                    {t.difficulty}
                  </Badge>
                </motion.div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Total: {formatTime(totalMinutesToday)}</span>
                <Link to="/app/mission">
                  <Button size="sm" variant="outline">
                    Go to Mission
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Overall Progress */}
        <Card delay={0.15}>
          <CardHeader title="Overall Progress" subtitle={activePlan?.title ?? 'No plan'} icon={<TrendingUp className="w-5 h-5" />} />
          <div className="flex flex-col items-center gap-4 py-2">
            <ProgressRing value={overallProgress} size={140} label={activePlan ? 'complete' : 'no plan'} />
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Topics</span>
                <span className="font-medium">{activePlan?.completed_topics ?? 0} / {activePlan?.total_topics ?? 0}</span>
              </div>
              {activePlan?.estimated_completion_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Est. completion</span>
                  <span className="font-medium">{formatDate(activePlan.estimated_completion_date)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Weekly Study */}
        <Card className="lg:col-span-2" delay={0.2}>
          <CardHeader title="Weekly Study" subtitle="Minutes studied per day" icon={<TrendingUp className="w-5 h-5" />} />
          <div className="flex items-end justify-between gap-2 h-40 pt-4">
            {last7.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.minutes / maxWeekly) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-brand-500 to-accent-400 min-h-[4px]"
                    style={{ height: `${Math.max(4, (d.minutes / maxWeekly) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{d.day}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{d.minutes}m</span>
              </div>
            ))}
          </div>
        </Card>

        {/* XP & Level */}
        <Card delay={0.25}>
          <CardHeader title="Level & XP" subtitle={`Level ${profile?.level ?? 1}`} icon={<Zap className="w-5 h-5" />} />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">{xp.current} XP</span>
                <span className="text-slate-500 dark:text-slate-400">{xp.needed} XP</span>
              </div>
              <ProgressBar value={xp.pct} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total XP</p>
                <p className="font-display font-bold text-lg">{profile?.xp ?? 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Consistency</p>
                <p className="font-display font-bold text-lg">{consistency}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Plans */}
        <Card className="lg:col-span-2" delay={0.3}>
          <CardHeader
            title="Current Learning Plans"
            subtitle={`${plans.length} plan${plans.length !== 1 ? 's' : ''}`}
            icon={<Target className="w-5 h-5" />}
            action={<Link to="/app/plans"><Button size="sm" variant="ghost">View all</Button></Link>}
          />
          {plans.length === 0 ? (
            <EmptyState
              icon={<Target className="w-7 h-7" />}
              title="No learning plans yet"
              description="Generate your first AI-powered learning plan to get started."
              action={<Link to="/app/plans"><Button size="sm"><Target className="w-4 h-4" />Create Plan</Button></Link>}
            />
          ) : (
            <div className="space-y-3">
              {plans.slice(0, 3).map((p: LearningPlan) => (
                <Link key={p.id} to="/app/roadmap" className="block">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{p.title}</span>
                      <Badge variant={p.status === 'active' ? 'success' : p.status === 'completed' ? 'info' : 'default'}>{p.status}</Badge>
                    </div>
                    <ProgressBar value={pct(p.completed_topics, p.total_topics)} />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{p.completed_topics} / {p.total_topics} topics · {pct(p.completed_topics, p.total_topics)}%</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Motivational Quote */}
        <Card delay={0.35} className="bg-gradient-to-br from-brand-500/5 to-accent-500/5">
          <div className="flex flex-col items-center text-center py-4">
            <Quote className="w-8 h-8 text-brand-400 mb-3" />
            <p className="font-display font-medium text-base text-slate-700 dark:text-slate-300 italic">"{dailyQuote()}"</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
