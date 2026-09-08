/*
# EduPilot AI — Core Schema

## Overview
Creates the full data model for the EduPilot AI personal learning coach: user
profiles, learning plans, roadmap topics (the hierarchical month/week/day/topic
plan), daily task completions, achievements, chat history with the AI mentor,
and notifications. All tables are owner-scoped to the authenticated user via
`auth.uid()` and protected with row-level security.

## New Tables
1. `profiles` — extended student info collected during onboarding
   - `id` (uuid, PK, references auth.users)
   - `full_name`, `college`, `branch`, `year`, `avatar_url`
   - `skill_level` (beginner | intermediate | advanced)
   - `daily_study_time` (minutes per day the student commits to)
   - `xp` (gamification points), `level`, `streak` (consecutive study days)
   - `last_study_date` (date of last completed mission, for streak math)
   - `onboarded` (boolean, false until onboarding form is submitted)
   - `created_at`, `updated_at`
2. `learning_plans` — a student's learning goal and generated roadmap metadata
   - `id` (uuid, PK)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `title` (e.g. "MERN Stack Developer")
   - `goal` (free-text career goal)
   - `skill_level`, `duration_months`, `daily_study_time`
   - `status` (active | paused | completed)
   - `total_topics`, `completed_topics` (progress counters)
   - `estimated_completion_date` (projected finish date)
   - `created_at`, `updated_at`
3. `roadmap_topics` — the granular plan items (month/week/day/topic)
   - `id` (uuid, PK)
   - `plan_id` (uuid, FK to learning_plans, cascade delete)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `month`, `week`, `day` (integers positioning the topic in the plan)
   - `title`, `description`, `learning_objective`
   - `estimated_minutes`, `difficulty` (beginner | intermediate | advanced)
   - `resources` (jsonb array of {type, title, url})
   - `status` (locked | available | in_progress | completed)
   - `completed_at` (timestamptz, null until done)
   - `order_index` (int, ordering within a day)
   - `created_at`
4. `daily_completions` — one row per day a student completes their mission
   - `id` (uuid, PK)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `plan_id` (uuid, FK to learning_plans, cascade delete)
   - `study_date` (date)
   - `topics_completed` (int), `minutes_studied` (int)
   - `created_at`
   - unique on (user_id, plan_id, study_date)
5. `achievements` — badges/awards a student has unlocked
   - `id` (uuid, PK)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `code` (e.g. "first_mission", "7_day_streak")
   - `title`, `description`, `icon` (lucide icon name)
   - `unlocked_at` (timestamptz)
   - unique on (user_id, code)
6. `chat_messages` — AI mentor conversation history
   - `id` (uuid, PK)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `role` (user | assistant)
   - `content` (text)
   - `created_at`
7. `notifications` — in-app notifications/reminders
   - `id` (uuid, PK)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `type` (reminder | achievement | completion | streak | info)
   - `title`, `body`
   - `read` (boolean, default false)
   - `created_at`

## Security
- RLS enabled on every table.
- Each table has 4 owner-scoped CRUD policies (SELECT/INSERT/UPDATE/DELETE)
  scoped to `auth.uid() = user_id` (or `id` for profiles).
- Owner columns default to `auth.uid()` so inserts that omit `user_id` succeed.
- Child tables (roadmap_topics, daily_completions) also carry a `user_id` for
  direct ownership checks rather than joining through the parent.

## Notes
1. `profiles` is created but NOT linked via trigger — the frontend creates the
   profile row on first onboarding. A trigger is avoided to keep the migration
   minimal and idempotent.
2. All timestamps default to `now()`.
3. `resources` on roadmap_topics is a jsonb array so the frontend can store
   multiple typed resource links per topic without a separate table.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  college text,
  branch text,
  year text,
  avatar_url text,
  skill_level text NOT NULL DEFAULT 'beginner',
  daily_study_time int NOT NULL DEFAULT 60,
  xp int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  streak int NOT NULL DEFAULT 0,
  last_study_date date,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- learning_plans
CREATE TABLE IF NOT EXISTS learning_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  goal text,
  skill_level text NOT NULL DEFAULT 'beginner',
  duration_months int NOT NULL DEFAULT 3,
  daily_study_time int NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'active',
  total_topics int NOT NULL DEFAULT 0,
  completed_topics int NOT NULL DEFAULT 0,
  estimated_completion_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_plans" ON learning_plans;
CREATE POLICY "select_own_plans" ON learning_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_plans" ON learning_plans;
CREATE POLICY "insert_own_plans" ON learning_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_plans" ON learning_plans;
CREATE POLICY "update_own_plans" ON learning_plans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_plans" ON learning_plans;
CREATE POLICY "delete_own_plans" ON learning_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- roadmap_topics
CREATE TABLE IF NOT EXISTS roadmap_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  month int NOT NULL,
  week int NOT NULL,
  day int NOT NULL,
  title text NOT NULL,
  description text,
  learning_objective text,
  estimated_minutes int NOT NULL DEFAULT 60,
  difficulty text NOT NULL DEFAULT 'beginner',
  resources jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'locked',
  completed_at timestamptz,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE roadmap_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_topics" ON roadmap_topics;
CREATE POLICY "select_own_topics" ON roadmap_topics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_topics" ON roadmap_topics;
CREATE POLICY "insert_own_topics" ON roadmap_topics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_topics" ON roadmap_topics;
CREATE POLICY "update_own_topics" ON roadmap_topics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_topics" ON roadmap_topics;
CREATE POLICY "delete_own_topics" ON roadmap_topics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- daily_completions
CREATE TABLE IF NOT EXISTS daily_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
  study_date date NOT NULL,
  topics_completed int NOT NULL DEFAULT 0,
  minutes_studied int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, plan_id, study_date)
);
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_completions" ON daily_completions;
CREATE POLICY "select_own_completions" ON daily_completions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_completions" ON daily_completions;
CREATE POLICY "insert_own_completions" ON daily_completions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_completions" ON daily_completions;
CREATE POLICY "update_own_completions" ON daily_completions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_completions" ON daily_completions;
CREATE POLICY "delete_own_completions" ON daily_completions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE (user_id, code)
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_achievements" ON achievements;
CREATE POLICY "select_own_achievements" ON achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_achievements" ON achievements;
CREATE POLICY "insert_own_achievements" ON achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_achievements" ON achievements;
CREATE POLICY "update_own_achievements" ON achievements FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_achievements" ON achievements;
CREATE POLICY "delete_own_achievements" ON achievements FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_chats" ON chat_messages;
CREATE POLICY "select_own_chats" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chats" ON chat_messages;
CREATE POLICY "insert_own_chats" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chats" ON chat_messages;
CREATE POLICY "delete_own_chats" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_plan ON roadmap_topics(plan_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_user ON roadmap_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_user ON daily_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_user ON learning_plans(user_id);