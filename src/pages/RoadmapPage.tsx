import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  ChevronDown,
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Code,
  Target as TargetIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePlans, useTopics } from '@/hooks/useData';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { pct, formatTime, cn } from '@/lib/utils';
import type { RoadmapTopic, Resource } from '@/lib/types';
import { Link } from 'react-router-dom';

const resourceIcons: Record<Resource['type'], typeof BookOpen> = {
  docs: BookOpen,
  video: Video,
  practice: Code,
  article: FileText,
  project: TargetIcon,
};

export function RoadmapPage() {
  const { plans } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const activePlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0] ?? null;
  const { topics, loading, refresh } = useTopics(activePlan?.id ?? null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]));
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const toggleMonth = (m: number) => setExpandedMonths((prev) => {
    const next = new Set(prev);
    if (next.has(m)) next.delete(m); else next.add(m);
    return next;
  });
  const toggleWeek = (key: string) => setExpandedWeeks((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  interface MonthGroup {
    month: number;
    weeks: Array<{ week: number; topics: RoadmapTopic[] }>;
  }

  const grouped = useMemo<MonthGroup[]>(() => {
    const monthData: Record<number, Record<number, RoadmapTopic[]>> = {};
    for (const t of topics) {
      if (!monthData[t.month]) monthData[t.month] = {};
      if (!monthData[t.month][t.week]) monthData[t.month][t.week] = [];
      monthData[t.month][t.week].push(t);
    }
    const result: MonthGroup[] = [];
    for (const month of Object.keys(monthData).map(Number).sort((a, b) => a - b)) {
      const weeks: Array<{ week: number; topics: RoadmapTopic[] }> = [];
      for (const week of Object.keys(monthData[month]).map(Number).sort((a, b) => a - b)) {
        weeks.push({ week, topics: monthData[month][week] });
      }
      result.push({ month, weeks });
    }
    return result;
  }, [topics]);

  const toggleTopic = async (topic: RoadmapTopic) => {
    if (topic.status === 'locked') {
      toast('Complete previous topics first to unlock this one', 'info');
      return;
    }
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
    if (activePlan) {
      const delta = newStatus === 'completed' ? 1 : -1;
      const newCompleted = Math.max(0, activePlan.completed_topics + delta);
      const newStatus2 = newCompleted >= activePlan.total_topics ? 'completed' : 'active';
      await supabase
        .from('learning_plans')
        .update({ completed_topics: newCompleted, status: newStatus2, updated_at: new Date().toISOString() })
        .eq('id', activePlan.id);
    }

    // Unlock next topic
    if (newStatus === 'completed') {
      const nextTopic = topics.find((t) => t.order_index === topic.order_index + 1 && t.status === 'locked');
      if (nextTopic) {
        await supabase.from('roadmap_topics').update({ status: 'available' }).eq('id', nextTopic.id);
      }
    } else {
      // Re-lock the next topic if we un-complete
      const nextTopic = topics.find((t) => t.order_index === topic.order_index + 1 && t.status === 'available' && t.order_index > 0);
      if (nextTopic) {
        const prevTopic = topics.find((t) => t.order_index === nextTopic.order_index - 1);
        if (prevTopic && prevTopic.status !== 'completed') {
          await supabase.from('roadmap_topics').update({ status: 'locked' }).eq('id', nextTopic.id);
        }
      }
    }

    refresh();
    toast(newStatus === 'completed' ? 'Topic completed! +10 XP' : 'Topic marked incomplete', newStatus === 'completed' ? 'success' : 'info');
  };

  if (plans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <EmptyState
            icon={<Map className="w-7 h-7" />}
            title="No roadmap yet"
            description="Create a learning plan first to see your personalized roadmap timeline."
            action={<Link to="/app/plans"><Button size="sm"><TargetIcon className="w-4 h-4" />Create Plan</Button></Link>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Learning Roadmap</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your complete journey from basics to mastery</p>
        </div>
        {plans.length > 1 && (
          <select
            value={activePlan?.id ?? ''}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        )}
      </div>

      {activePlan && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display font-semibold text-lg">{activePlan.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{activePlan.completed_topics} / {activePlan.total_topics} topics completed</p>
            </div>
            <span className="font-display font-bold text-2xl gradient-text">{pct(activePlan.completed_topics, activePlan.total_topics)}%</span>
          </div>
          <ProgressBar value={pct(activePlan.completed_topics, activePlan.total_topics)} />
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ month, weeks }) => {
            const monthTopics: RoadmapTopic[] = weeks.flatMap((w) => w.topics);
            const monthCompleted = monthTopics.filter((t) => t.status === 'completed').length;
            const monthPct = pct(monthCompleted, monthTopics.length);
            const isExpanded = expandedMonths.has(month);

            return (
              <Card key={month}>
                <button onClick={() => toggleMonth(month)} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center font-display font-bold">
                      M{month}
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-semibold text-base">Month {month}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{monthCompleted}/{monthTopics.length} topics · {monthPct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 hidden sm:block"><ProgressBar value={monthPct} /></div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-3">
                        {weeks.map(({ week, topics: weekTopics }) => {
                          const weekKey = `${month}-${week}`;
                          const weekExpanded = expandedWeeks.has(weekKey);
                          const weekCompleted = weekTopics.filter((t: RoadmapTopic) => t.status === 'completed').length;
                          return (
                            <div key={weekKey}>
                              <button
                                onClick={() => toggleWeek(weekKey)}
                                className="flex items-center gap-2 w-full text-left py-2"
                              >
                                {weekExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Week {week}</span>
                                <Badge variant="default" className="text-xs">{weekCompleted}/{weekTopics.length}</Badge>
                              </button>
                              <AnimatePresence>
                                {weekExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pl-6 space-y-2 mt-1">
                                      {weekTopics.map((topic) => (
                                        <TopicRow key={topic.id} topic={topic} onToggle={() => toggleTopic(topic)} />
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TopicRow({ topic, onToggle }: { topic: RoadmapTopic; onToggle: () => void }) {
  const [showResources, setShowResources] = useState(false);
  const isLocked = topic.status === 'locked';
  const isCompleted = topic.status === 'completed';

  return (
    <div className={cn('rounded-xl border transition-all', isLocked ? 'border-slate-100 dark:border-slate-800/50 opacity-60' : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700')}>
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={onToggle}
          disabled={isLocked}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
            isCompleted ? 'bg-accent-500 border-accent-500' : isLocked ? 'border-slate-300 dark:border-slate-700' : 'border-brand-400 hover:border-brand-500',
          )}
        >
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn('text-sm font-medium', isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200')}>
              {topic.title}
            </p>
            <Badge variant={topic.difficulty === 'beginner' ? 'success' : topic.difficulty === 'intermediate' ? 'warning' : 'error'}>
              {topic.difficulty}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {formatTime(topic.estimated_minutes)} · Day {topic.day}
          </p>
          {topic.description && !showResources && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{topic.description}</p>
          )}
        </div>

        {!isLocked && topic.resources.length > 0 && (
          <button
            onClick={() => setShowResources((s) => !s)}
            className="text-xs text-brand-500 hover:underline shrink-0 mt-1"
          >
            {showResources ? 'Hide' : 'Resources'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResources && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topic.resources.map((r, i) => {
                const Icon = resourceIcons[r.type] ?? BookOpen;
                return (
                  <a
                    key={i}
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
  );
}
