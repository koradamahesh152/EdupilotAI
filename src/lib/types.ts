export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type TopicStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type PlanStatus = 'active' | 'paused' | 'completed';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Resource {
  type: 'docs' | 'video' | 'practice' | 'article' | 'project';
  title: string;
  url: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  college: string | null;
  branch: string | null;
  year: string | null;
  avatar_url: string | null;
  skill_level: SkillLevel;
  daily_study_time: number;
  xp: number;
  level: number;
  streak: number;
  last_study_date: string | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  title: string;
  goal: string | null;
  skill_level: SkillLevel;
  duration_months: number;
  daily_study_time: number;
  status: PlanStatus;
  total_topics: number;
  completed_topics: number;
  estimated_completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapTopic {
  id: string;
  plan_id: string;
  user_id: string;
  month: number;
  week: number;
  day: number;
  title: string;
  description: string | null;
  learning_objective: string | null;
  estimated_minutes: number;
  difficulty: Difficulty;
  resources: Resource[];
  status: TopicStatus;
  completed_at: string | null;
  order_index: number;
  created_at: string;
}

export interface DailyCompletion {
  id: string;
  user_id: string;
  plan_id: string;
  study_date: string;
  topics_completed: number;
  minutes_studied: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  code: string;
  title: string;
  description: string | null;
  icon: string;
  unlocked_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'reminder' | 'achievement' | 'completion' | 'streak' | 'info';
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

export interface OnboardingData {
  full_name: string;
  college: string;
  branch: string;
  year: string;
  skill_level: SkillLevel;
  goal: string;
  duration_months: number;
  daily_study_time: number;
  career_goal: string;
}
