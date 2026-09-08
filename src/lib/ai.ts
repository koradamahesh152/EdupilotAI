import type { LearningPlan, Profile, RoadmapTopic } from './types';
import { pct } from './utils';

interface MentorContext {
  profile: Profile | null;
  activePlan: LearningPlan | null;
  topics: RoadmapTopic[];
  todayTopics: RoadmapTopic[];
}

const greetings = [
  "Hey! I'm your AI learning mentor. ",
  "Great to see you! ",
  "Welcome back! ",
  "Let's keep the momentum going. ",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMentorReply(question: string, ctx: MentorContext): string {
  const q = question.toLowerCase().trim();
  const plan = ctx.activePlan;
  const progress = plan ? pct(plan.completed_topics, plan.total_topics) : 0;

  // What should I learn today?
  if (q.includes('today') || q.includes('learn now') || q.includes('what should i do')) {
    if (!plan) return "You don't have an active learning plan yet. Head to the Learning Plans page and generate one — I'll build a full roadmap for you!";
    if (ctx.todayTopics.length === 0) {
      const next = ctx.topics.find((t) => t.status !== 'completed');
      if (next) {
        return `Today's focus: **${next.title}**. ${next.description ?? ''} Estimated time: ${next.estimated_minutes} minutes. Take it step by step — you've got this!`;
      }
      return "Amazing — you've completed every topic in this plan! Consider starting a new learning goal to keep growing.";
    }
    const titles = ctx.todayTopics.map((t) => t.title).join(', ');
    const totalMin = ctx.todayTopics.reduce((s, t) => s + t.estimated_minutes, 0);
    return `Today's mission covers: ${titles}. Total estimated time: ${totalMin} minutes. Focus on one topic at a time, check it off, and you'll build a strong streak!`;
  }

  // Am I on schedule?
  if (q.includes('on schedule') || q.includes('on track') || q.includes('progress')) {
    if (!plan) return "Once you create a learning plan, I can tell you exactly whether you're on track. Generate one from the Learning Plans page!";
    const remaining = plan.total_topics - plan.completed_topics;
    if (progress >= 75) return `You're doing fantastic! ${progress}% done with only ${remaining} topics left. You're well ahead of schedule — keep pushing!`;
    if (progress >= 40) return `Solid progress at ${progress}%. You're on a good pace. Stay consistent with your daily missions and you'll hit your goal on time.`;
    if (progress > 0) return `You're at ${progress}% — still early in the journey. The key is daily consistency. Even 30 minutes a day compounds fast. Don't skip today!`;
    return "You haven't completed any topics yet, and that's okay! Start with today's mission — small steps lead to big results.";
  }

  // What should I learn next?
  if (q.includes('next') || q.includes('after this')) {
    const next = ctx.topics.find((t) => t.status !== 'completed');
    if (!next) return "You've completed everything in this plan! That's a huge achievement. Time to set a new, bigger goal.";
    return `After your current topic, move on to **${next.title}**. ${next.learning_objective ?? ''} I recommend reviewing the suggested resources before diving in.`;
  }

  // How can I improve?
  if (q.includes('improve') || q.includes('better') || q.includes('faster')) {
    const tips = [
      "To improve faster, try active recall: after studying a topic, close your notes and explain it back to yourself out loud.",
      "Consistency beats intensity. Studying 1 hour daily is far more effective than 7 hours once a week. Protect your streak!",
      "Apply what you learn immediately. Build tiny projects or solve problems right after studying a concept — it locks in the knowledge.",
      "Teach what you learn. Explaining a concept to someone else (or even to a rubber duck!) reveals gaps in your understanding.",
      "Break topics into 25-minute focused blocks (Pomodoro). Short, intense focus sessions with breaks beat long, distracted study.",
    ];
    return pick(tips);
  }

  // Streak / motivation
  if (q.includes('streak') || q.includes('motivat') || q.includes('stuck') || q.includes('demotivat')) {
    const streak = ctx.profile?.streak ?? 0;
    if (streak >= 7) return `You're on a ${streak}-day streak — that's incredible! Momentum is on your side. Don't break the chain today. Even a short session counts.`;
    return "Every expert was once a beginner who refused to give up. Start small today — even 15 minutes keeps the habit alive. You've got this!";
  }

  // Explain a concept
  if (q.startsWith('explain') || q.includes('what is') || q.includes('how does')) {
    const concept = question.replace(/^(explain|what is|how does|how do|what are)\s+/i, '').replace(/\?$/, '');
    return `Here's a quick overview of **${concept}**: This is a key concept in your learning journey. I recommend checking the suggested resources on your roadmap for structured material — search for "${concept}" in the Resources page for docs, videos, and practice exercises. Try to apply it in a small example right after learning it!`;
  }

  // Default
  const planName = plan?.title ?? 'your learning plan';
  return `${pick(greetings)}You're currently working on **${planName}** at ${progress}% progress. You can ask me things like: "What should I learn today?", "Am I on schedule?", "What should I learn next?", "How can I improve?", or "Explain React Hooks". I'm here to guide you every step of the way!`;
}

export const ACHIEVEMENT_DEFS = [
  { code: 'first_mission', title: 'First Steps', description: 'Complete your first learning mission', icon: 'Footprints' },
  { code: 'first_plan', title: 'Planner', description: 'Generate your first AI learning plan', icon: 'Sparkles' },
  { code: 'streak_3', title: 'Getting Consistent', description: 'Maintain a 3-day study streak', icon: 'Flame' },
  { code: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day study streak', icon: 'Flame' },
  { code: 'streak_30', title: 'Unstoppable', description: 'Maintain a 30-day study streak', icon: 'Trophy' },
  { code: 'topics_10', title: 'Knowledge Seeker', description: 'Complete 10 topics', icon: 'BookOpen' },
  { code: 'topics_50', title: 'Scholar', description: 'Complete 50 topics', icon: 'GraduationCap' },
  { code: 'plan_25', title: 'Quarter Done', description: 'Reach 25% on any plan', icon: 'Target' },
  { code: 'plan_50', title: 'Halfway There', description: 'Reach 50% on any plan', icon: 'Target' },
  { code: 'plan_100', title: 'Goal Crusher', description: 'Complete an entire learning plan', icon: 'Trophy' },
  { code: 'level_5', title: 'Rising Star', description: 'Reach level 5', icon: 'Star' },
  { code: 'level_10', title: 'Dedicated Learner', description: 'Reach level 10', icon: 'Award' },
] as const;

export type AchievementCode = (typeof ACHIEVEMENT_DEFS)[number]['code'];

export function checkAchievements(params: {
  streak: number;
  totalTopicsCompleted: number;
  planProgress: number;
  level: number;
  hasFirstMission: boolean;
  hasFirstPlan: boolean;
}): string[] {
  const codes: string[] = [];
  if (params.hasFirstMission) codes.push('first_mission');
  if (params.hasFirstPlan) codes.push('first_plan');
  if (params.streak >= 3) codes.push('streak_3');
  if (params.streak >= 7) codes.push('streak_7');
  if (params.streak >= 30) codes.push('streak_30');
  if (params.totalTopicsCompleted >= 10) codes.push('topics_10');
  if (params.totalTopicsCompleted >= 50) codes.push('topics_50');
  if (params.planProgress >= 25) codes.push('plan_25');
  if (params.planProgress >= 50) codes.push('plan_50');
  if (params.planProgress >= 100) codes.push('plan_100');
  if (params.level >= 5) codes.push('level_5');
  if (params.level >= 10) codes.push('level_10');
  return codes;
}

export const MOTIVATIONAL_QUOTES = [
  "The expert in anything was once a beginner.",
  "Small steps every day lead to big results.",
  "Consistency is the bridge between goals and accomplishment.",
  "Learning never exhausts the mind — it fuels it.",
  "The beautiful thing about learning is nobody can take it away from you.",
  "Don't watch the clock; do what it does — keep going.",
  "Your future is created by what you do today.",
  "Skill comes from consistent, deliberate practice.",
  "The only way to do great work is to love what you learn.",
  "Every topic you master is a brick in the house of your career.",
];

export function dailyQuote(): string {
  const idx = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[idx];
}
