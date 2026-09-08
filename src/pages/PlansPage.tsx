import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Sparkles, Trash2, Play, Pause, CheckCircle2, Clock, Layers } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans, unlockAchievement, createNotification } from '@/hooks/useData';
import { generateRoadmap } from '@/lib/roadmap';
import { supabase } from '@/lib/supabase';
import { pct, formatDate, formatTime, todayISO } from '@/lib/utils';
import type { LearningPlan, SkillLevel, Difficulty, Resource } from '@/lib/types';
import { cn } from '@/lib/utils';

const GOAL_OPTIONS = [
  'MERN Stack Developer',
  'Java Full Stack',
  'DSA & Competitive Programming',
  'Python Programming',
  'Data Science',
  'AI & Machine Learning',
  'GATE Preparation',
  'Placement Preparation',
  'Communication Skills',
];

const DURATION_OPTIONS = [1, 3, 6, 12];
const STUDY_TIME_OPTIONS = [30, 60, 120, 180, 240];
const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];

export function PlansPage() {
  const { profile, user } = useAuth();
  const { plans, loading, refresh } = usePlans();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    goal: GOAL_OPTIONS[0],
    skill_level: (profile?.skill_level ?? 'beginner') as SkillLevel,
    duration_months: 3,
    daily_study_time: profile?.daily_study_time ?? 60,
    career_goal: '',
  });

  const handleGenerate = async () => {
    const userId = profile?.id ?? user?.id;
    if (!userId) {
      toast('Please sign in to create a plan', 'error');
      return;
    }
    setGenerating(true);
    try {
      const roadmap = generateRoadmap(form.goal, form.skill_level, form.duration_months, form.daily_study_time);

      // Calculate estimated completion date
      const estDate = new Date();
      estDate.setMonth(estDate.getMonth() + form.duration_months);

      // Create plan
      const { data: plan, error: planError } = await supabase
        .from('learning_plans')
        .insert({
          user_id: userId,
          title: form.goal,
          goal: form.career_goal || form.goal,
          skill_level: form.skill_level,
          duration_months: form.duration_months,
          daily_study_time: form.daily_study_time,
          total_topics: roadmap.totalTopics,
          completed_topics: 0,
          estimated_completion_date: estDate.toISOString().split('T')[0],
          status: 'active',
        })
        .select()
        .single();

      if (planError || !plan) throw new Error(planError?.message ?? 'Failed to create plan');

      // Create topics
      const topicRows: Array<{
        plan_id: string;
        user_id: string;
        month: number;
        week: number;
        day: number;
        title: string;
        description: string;
        learning_objective: string;
        estimated_minutes: number;
        difficulty: Difficulty;
        resources: Resource[];
        status: string;
        order_index: number;
      }> = [];

      let order = 0;
      let isFirst = true;
      for (const month of roadmap.months) {
        for (const week of month.weeks) {
          for (const day of week.days) {
            for (const topic of day.topics) {
              topicRows.push({
                plan_id: plan.id,
                user_id: userId,
                month: month.month,
                week: week.week,
                day: day.day,
                title: topic.title,
                description: topic.description,
                learning_objective: topic.learning_objective,
                estimated_minutes: topic.estimated_minutes,
                difficulty: topic.difficulty,
                resources: topic.resources,
                status: isFirst ? 'available' : 'locked',
                order_index: order++,
              });
              isFirst = false;
            }
          }
        }
      }

      // Insert in batches of 500
      for (let i = 0; i < topicRows.length; i += 500) {
        const batch = topicRows.slice(i, i + 500);
        const { error: topicError } = await supabase.from('roadmap_topics').insert(batch);
        if (topicError) throw new Error(topicError.message);
      }

      // Unlock first_plan achievement
      await unlockAchievement(userId, 'first_plan', 'Planner', 'Generate your first AI learning plan', 'Sparkles');

      await createNotification(userId, 'info', 'New Plan Created', `Your "${form.goal}" plan is ready! Start with today's mission.`);

      await refresh();
      toast('AI plan generated successfully!', 'success');
      setShowModal(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to generate plan', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Delete this plan and all its topics? This cannot be undone.')) return;
    const { error } = await supabase.from('learning_plans').delete().eq('id', planId);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Plan deleted', 'success');
      refresh();
    }
  };

  const toggleStatus = async (plan: LearningPlan) => {
    const newStatus = plan.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('learning_plans').update({ status: newStatus }).eq('id', plan.id);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast(`Plan ${newStatus === 'active' ? 'resumed' : 'paused'}`, 'success');
      refresh();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Learning Plans</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage your learning journeys</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          New Plan
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Target className="w-7 h-7" />}
            title="No learning plans yet"
            description="Generate your first AI-powered learning plan. Just tell us your goal and we'll build a complete roadmap for you."
            action={<Button onClick={() => setShowModal(true)}><Sparkles className="w-4 h-4" />Generate AI Plan</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <CardHeader
                  title={plan.title}
                  subtitle={plan.goal ?? undefined}
                  icon={<Target className="w-5 h-5" />}
                  action={<Badge variant={plan.status === 'active' ? 'success' : plan.status === 'completed' ? 'info' : 'default'}>{plan.status}</Badge>}
                />
                <div className="space-y-3">
                  <ProgressBar value={pct(plan.completed_topics, plan.total_topics)} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{plan.completed_topics} / {plan.total_topics} topics</span>
                    <span className="font-medium">{pct(plan.completed_topics, plan.total_topics)}%</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(plan.daily_study_time)}/day</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{plan.duration_months} months</span>
                    {plan.estimated_completion_date && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{formatDate(plan.estimated_completion_date)}</span>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(plan)}>
                      {plan.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {plan.status === 'active' ? 'Pause' : 'Resume'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)} className="text-error-500 hover:text-error-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Generate Plan Modal */}
      <Modal open={showModal} onClose={() => !generating && setShowModal(false)} title="Generate AI Learning Plan" size="md">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Learning Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, goal: g })}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left text-sm transition-all',
                    form.goal === g ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300',
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Skill Level</label>
            <div className="grid grid-cols-3 gap-2">
              {SKILL_LEVELS.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, skill_level: s })}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center text-sm capitalize transition-all',
                    form.skill_level === s ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm({ ...form, duration_months: d })}
                    className={cn(
                      'p-2.5 rounded-xl border-2 text-center text-sm transition-all',
                      form.duration_months === d ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-slate-200 dark:border-slate-800',
                    )}
                  >
                    {d}mo
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Daily Study Time</label>
              <div className="grid grid-cols-5 gap-1">
                {STUDY_TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, daily_study_time: t })}
                    className={cn(
                      'p-2.5 rounded-xl border-2 text-center text-xs transition-all',
                      form.daily_study_time === t ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-slate-200 dark:border-slate-800',
                    )}
                  >
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Career Goal (optional)</label>
            <input
              value={form.career_goal}
              onChange={(e) => setForm({ ...form, career_goal: e.target.value })}
              placeholder="e.g. Become MERN Stack Developer"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30">
            <Sparkles className="w-5 h-5 text-brand-500 shrink-0" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The AI will generate a complete roadmap with months, weeks, days, and topics — tailored to your level and schedule.
            </p>
          </div>

          <Button onClick={handleGenerate} size="lg" className="w-full" disabled={generating}>
            {generating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Generating your roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Plan
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
