import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Flame,
  Zap,
  Star,
  BookOpen,
  Video,
  FileText,
  Code,
  Target as TargetIcon,
  ExternalLink,
  Sparkles,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans, useTopics, unlockAchievement, createNotification, recordDailyCompletion, updateStreakAndXP } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { formatTime, pct, cn, todayISO } from '@/lib/utils';
import type { RoadmapTopic, Resource } from '@/lib/types';
import { Link } from 'react-router-dom';

const resourceIcons: Record<Resource['type'], typeof BookOpen> = {
  docs: BookOpen,
  video: Video,
  practice: Code,
  article: FileText,
  project: TargetIcon,
};

export function MissionPage() {
  const { profile, refreshProfile } = useAuth();
  const { plans } = usePlans();
  const activePlan = plans.find((p) => p.status === 'active') ?? plans[0] ?? null;
  const { topics, refresh } = useTopics(activePlan?.id ?? null);
  const { toast } = useToast();
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const todayTopics = topics.filter((t) => t.status === 'available' || t.status === 'in_progress');
  const completedCount = todayTopics.filter((t) => t.status === 'completed').length;
  const totalMinutes = todayTopics.reduce((s, t) => s + t.estimated_minutes, 0);
  const missionPct = todayTopics.length > 0 ? pct(completedCount, todayTopics.length) : 0;
  const allDone = todayTopics.length > 0 && completedCount === todayTopics.length;

  const toggleTopic = async (topic: RoadmapTopic) => {
    if (!profile || !activePlan) return;
    const newStatus = topic.status === 'completed' ? 'available' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('roadmap_topics')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', topic.id);

    if (error) {
      toast(error.message, 'error');
      return;
    }

    // Update plan counters
    const delta = newStatus === 'completed' ? 1 : -1;
    const newCompleted = Math.max(0, activePlan.completed_topics + delta);
    const newPlanStatus = newCompleted >= activePlan.total_topics ? 'completed' : 'active';
    await supabase
      .from('learning_plans')
      .update({ completed_topics: newCompleted, status: newPlanStatus, updated_at: new Date().toISOString() })
      .eq('id', activePlan.id);

    // Unlock next topic
    if (newStatus === 'completed') {
      const nextTopic = topics.find((t) => t.order_index === topic.order_index + 1 && t.status === 'locked');
      if (nextTopic) {
        await supabase.from('roadmap_topics').update({ status: 'available' }).eq('id', nextTopic.id);
      }
    }

    // If completed, give XP and record
    if (newStatus === 'completed') {
      await updateStreakAndXP(profile.id, 10);
      await recordDailyCompletion(profile.id, activePlan.id, 1, topic.estimated_minutes);
      await refreshProfile();

      // Check achievements
      const totalCompleted = newCompleted;
      const planProgress = pct(totalCompleted, activePlan.total_topics);
      const newLevel = Math.floor(((profile.xp ?? 0) + 10) / 100) + 1;

      if (totalCompleted === 1) {
        await unlockAchievement(profile.id, 'first_mission', 'First Steps', 'Complete your first learning mission', 'Footprints');
      }
      if (profile.streak + 1 >= 3) await unlockAchievement(profile.id, 'streak_3', 'Getting Consistent', 'Maintain a 3-day study streak', 'Flame');
      if (profile.streak + 1 >= 7) await unlockAchievement(profile.id, 'streak_7', 'Week Warrior', 'Maintain a 7-day study streak', 'Flame');
      if (totalCompleted >= 10) await unlockAchievement(profile.id, 'topics_10', 'Knowledge Seeker', 'Complete 10 topics', 'BookOpen');
      if (totalCompleted >= 50) await unlockAchievement(profile.id, 'topics_50', 'Scholar', 'Complete 50 topics', 'GraduationCap');
      if (planProgress >= 25) await unlockAchievement(profile.id, 'plan_25', 'Quarter Done', 'Reach 25% on any plan', 'Target');
      if (planProgress >= 50) await unlockAchievement(profile.id, 'plan_50', 'Halfway There', 'Reach 50% on any plan', 'Target');
      if (planProgress >= 100) await unlockAchievement(profile.id, 'plan_100', 'Goal Crusher', 'Complete an entire learning plan', 'Trophy');
      if (newLevel >= 5) await unlockAchievement(profile.id, 'level_5', 'Rising Star', 'Reach level 5', 'Star');
      if (newLevel >= 10) await unlockAchievement(profile.id, 'level_10', 'Dedicated Learner', 'Reach level 10', 'Award');

      await createNotification(profile.id, 'completion', 'Topic Completed!', `Great job on completing "${topic.title}". +10 XP earned!`);
    }

    refresh();

    // Check if all today's topics are done
    const remainingAfter = todayTopics.filter((t) => t.id !== topic.id && t.status !== 'completed');
    if (newStatus === 'completed' && remainingAfter.length === 0) {
      setShowCelebration(true);
      await createNotification(profile.id, 'streak', 'Mission Complete!', "You've completed today's mission. Tomorrow's mission is ready!");
    }
  };

  if (!activePlan) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <EmptyState
            icon={<CheckSquare className="w-7 h-7" />}
            title="No active learning plan"
            description="Create a learning plan to get your daily missions."
            action={<Link to="/app/plans"><Button size="sm"><Sparkles className="w-4 h-4" />Create Plan</Button></Link>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Today's Mission</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Focus on today's tasks. One step at a time.</p>
      </div>

      {/* Mission overview */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">{activePlan.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{todayTopics.length} topics · {formatTime(totalMinutes)} total</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display font-bold text-2xl gradient-text">{completedCount}/{todayTopics.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">completed</p>
            </div>
            <div className="w-24">
              <ProgressBar value={missionPct} />
            </div>
          </div>
        </div>
      </Card>

      {/* Topics */}
      {todayTopics.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PartyPopper className="w-7 h-7" />}
            title="All caught up!"
            description="You've completed all available topics. Come back tomorrow for your next mission, or explore the roadmap for more topics."
            action={<Link to="/app/roadmap"><Button size="sm" variant="outline"><ArrowRight className="w-4 h-4" />View Roadmap</Button></Link>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {todayTopics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      'mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110',
                      topic.status === 'completed' ? 'bg-accent-500 border-accent-500' : 'border-brand-400 hover:border-brand-500 bg-brand-50 dark:bg-brand-950/40',
                    )}
                  >
                    {topic.status === 'completed' && <CheckSquare className="w-4 h-4 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={cn('font-display font-semibold text-base', topic.status === 'completed' && 'text-slate-400 line-through')}>
                        {topic.title}
                      </h3>
                      <Badge variant={topic.difficulty === 'beginner' ? 'success' : topic.difficulty === 'intermediate' ? 'warning' : 'error'}>
                        {topic.difficulty}
                      </Badge>
                    </div>
                    {topic.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{topic.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{formatTime(topic.estimated_minutes)}</span>
                      <span className="flex items-center gap-1"><TargetIcon className="w-3 h-3" />Month {topic.month}, Week {topic.week}, Day {topic.day}</span>
                    </div>

                    {topic.learning_objective && (
                      <div className="mt-2 p-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/30">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Objective:</span> {topic.learning_objective}
                        </p>
                      </div>
                    )}

                    {/* Resources */}
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                        className="text-xs text-brand-500 hover:underline flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {expandedTopic === topic.id ? 'Hide resources' : `Show ${topic.resources.length} resources`}
                      </button>
                      <AnimatePresence>
                        {expandedTopic === topic.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {topic.resources.map((r, ri) => {
                                const Icon = resourceIcons[r.type] ?? BookOpen;
                                return (
                                  <a
                                    key={ri}
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                                  >
                                    <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                                    <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{r.title}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Celebration Modal */}
      <Modal open={showCelebration} onClose={() => setShowCelebration(false)} size="sm">
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <PartyPopper className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100 mb-2">Excellent Work!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">You completed today's learning mission.</p>
          <div className="space-y-2 mb-6 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Flame className="w-4 h-4 text-warning-500" /> Your learning streak has increased
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Star className="w-4 h-4 text-brand-500" /> You earned XP
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <BookOpen className="w-4 h-4 text-accent-500" /> Tomorrow's mission is ready
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <ArrowRight className="w-4 h-4 text-brand-500" /> You are one step closer to your goal
            </div>
          </div>
          <Button onClick={() => setShowCelebration(false)} className="w-full">Continue</Button>
        </div>
      </Modal>
    </div>
  );
}
