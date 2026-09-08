import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import type { OnboardingData, SkillLevel } from '@/lib/types';
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

const DURATION_OPTIONS = [
  { label: '1 Month', value: 1 },
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '12 Months', value: 12 },
];

const STUDY_TIME_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

const SKILL_LEVELS: { label: string; value: SkillLevel; desc: string }[] = [
  { label: 'Beginner', value: 'beginner', desc: 'Starting fresh' },
  { label: 'Intermediate', value: 'intermediate', desc: 'Some experience' },
  { label: 'Advanced', value: 'advanced', desc: 'Experienced' },
];

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    college: '',
    branch: '',
    year: '',
    skill_level: 'beginner',
    goal: GOAL_OPTIONS[0],
    duration_months: 3,
    daily_study_time: 60,
    career_goal: '',
  });

  const steps = [
    { title: 'Tell us about yourself', fields: ['full_name', 'college', 'branch', 'year'] },
    { title: 'What is your skill level?', fields: ['skill_level'] },
    { title: 'What do you want to learn?', fields: ['goal'] },
    { title: 'How long do you have?', fields: ['duration_months'] },
    { title: 'How much time daily?', fields: ['daily_study_time'] },
    { title: 'Your career goal', fields: ['career_goal'] },
  ];

  const canProceed = () => {
    const current = steps[step].fields;
    for (const f of current) {
      const val = data[f as keyof OnboardingData];
      if (typeof val === 'string' && !val.trim()) return false;
    }
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: data.full_name,
      college: data.college,
      branch: data.branch,
      year: data.year,
      skill_level: data.skill_level,
      daily_study_time: data.daily_study_time,
      onboarded: true,
    });
    setLoading(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      await refreshProfile();
      toast('Onboarding complete! Welcome to EduPilot AI.', 'success');
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-xl gradient-text">EduPilot AI</h1>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-8 bg-brand-500' : i < step ? 'w-1.5 bg-brand-400' : 'w-1.5 bg-slate-300 dark:bg-slate-700',
              )}
            />
          ))}
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100 mb-6">{steps[step].title}</h2>

              {step === 0 && (
                <div className="space-y-4">
                  <input
                    placeholder="Full Name"
                    value={data.full_name}
                    onChange={(e) => setData({ ...data, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                  <input
                    placeholder="College"
                    value={data.college}
                    onChange={(e) => setData({ ...data, college: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                  <input
                    placeholder="Branch (e.g. Computer Science)"
                    value={data.branch}
                    onChange={(e) => setData({ ...data, branch: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                  <input
                    placeholder="Year (e.g. 2nd Year)"
                    value={data.year}
                    onChange={(e) => setData({ ...data, year: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SKILL_LEVELS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setData({ ...data, skill_level: s.value })}
                      className={cn(
                        'p-5 rounded-2xl border-2 text-left transition-all',
                        data.skill_level === s.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-semibold">{s.label}</span>
                        {data.skill_level === s.value && <Check className="w-4 h-4 text-brand-500" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setData({ ...data, goal: g })}
                      className={cn(
                        'p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between',
                        data.goal === g
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                      )}
                    >
                      <span className="font-medium text-sm">{g}</span>
                      {data.goal === g && <Check className="w-4 h-4 text-brand-500" />}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setData({ ...data, duration_months: d.value })}
                      className={cn(
                        'p-5 rounded-2xl border-2 text-center transition-all',
                        data.duration_months === d.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                      )}
                    >
                      <span className="font-display font-bold text-lg">{d.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STUDY_TIME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setData({ ...data, daily_study_time: t.value })}
                      className={cn(
                        'p-5 rounded-2xl border-2 text-center transition-all',
                        data.daily_study_time === t.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                      )}
                    >
                      <span className="font-display font-bold text-lg">{t.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div>
                  <input
                    placeholder="e.g. Become MERN Stack Developer"
                    value={data.career_goal}
                    onChange={(e) => setData({ ...data, career_goal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                    This helps us tailor your roadmap and daily missions to your dream career.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => canProceed() && setStep((s) => s + 1)} disabled={!canProceed()}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={!canProceed() || loading}>
                {loading ? 'Saving...' : 'Get Started'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
