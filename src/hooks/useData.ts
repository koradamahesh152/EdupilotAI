import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { LearningPlan, RoadmapTopic, DailyCompletion, Achievement, Notification } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { todayISO } from '@/lib/utils';

export function usePlans() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setPlans((data as LearningPlan[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { plans, loading, refresh };
}

export function useTopics(planId: string | null) {
  const [topics, setTopics] = useState<RoadmapTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!planId) {
      setTopics([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('roadmap_topics')
      .select('*')
      .eq('plan_id', planId)
      .order('month', { ascending: true })
      .order('week', { ascending: true })
      .order('day', { ascending: true })
      .order('order_index', { ascending: true });
    setTopics((data as RoadmapTopic[]) ?? []);
    setLoading(false);
  }, [planId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { topics, loading, refresh };
}

export function useTodayTopics(planId: string | null) {
  const { topics } = useTopics(planId);
  // Today's mission: first N available/in-progress topics (one day's worth)
  const today = topics.filter((t) => t.status === 'available' || t.status === 'in_progress');
  return { todayTopics: today.slice(0, 5), allTopics: topics };
}

export function useCompletions() {
  const { profile } = useAuth();
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('user_id', profile.id)
      .order('study_date', { ascending: true });
    setCompletions((data as DailyCompletion[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { completions, loading, refresh };
}

export function useAchievements() {
  const { profile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', profile.id)
      .order('unlocked_at', { ascending: false });
    setAchievements((data as Achievement[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { achievements, loading, refresh };
}

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) ?? []);
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { notifications, refresh };
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  body: string,
) {
  await supabase.from('notifications').insert({ user_id: userId, type, title, body });
}

export async function unlockAchievement(userId: string, code: string, title: string, description: string, icon: string) {
  const { error } = await supabase
    .from('achievements')
    .upsert({ user_id: userId, code, title, description, icon }, { onConflict: 'user_id,code' });
  if (!error) {
    await createNotification(userId, 'achievement', `Achievement Unlocked: ${title}`, description);
  }
}

export async function recordDailyCompletion(userId: string, planId: string, topicsCompleted: number, minutesStudied: number) {
  const today = todayISO();
  await supabase
    .from('daily_completions')
    .upsert(
      { user_id: userId, plan_id: planId, study_date: today, topics_completed: topicsCompleted, minutes_studied: minutesStudied },
      { onConflict: 'user_id,plan_id,study_date' },
    );
}

export async function updateStreakAndXP(userId: string, xpGain: number) {
  const { data: profile } = await supabase.from('profiles').select('streak, last_study_date, xp, level').eq('id', userId).maybeSingle();
  if (!profile) return;

  const today = todayISO();
  const lastDate = profile.last_study_date;
  let newStreak = profile.streak ?? 0;

  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (lastDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  const newXp = (profile.xp ?? 0) + xpGain;
  const newLevel = Math.floor(newXp / 100) + 1;

  await supabase
    .from('profiles')
    .update({ streak: newStreak, last_study_date: today, xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', userId);
}
