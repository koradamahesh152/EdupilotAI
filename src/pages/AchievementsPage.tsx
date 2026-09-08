import { motion } from 'framer-motion';
import { Award, Lock, Footprints, Sparkles, Flame, Trophy, BookOpen, GraduationCap, Target, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAchievements } from '@/hooks/useData';
import { ACHIEVEMENT_DEFS } from '@/lib/ai';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Award> = {
  Footprints, Sparkles, Flame, Trophy, BookOpen, GraduationCap, Target, Star, Award,
};

export function AchievementsPage() {
  const { achievements } = useAchievements();
  const unlockedCodes = new Set(achievements.map((a) => a.code));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Achievements</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{achievements.length} of {ACHIEVEMENT_DEFS.length} unlocked</p>
      </div>

      {/* Progress bar */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-sm">Collection Progress</span>
              <span className="font-display font-bold">{Math.round((achievements.length / ACHIEVEMENT_DEFS.length) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(achievements.length / ACHIEVEMENT_DEFS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {achievements.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Award className="w-7 h-7" />}
            title="No achievements yet"
            description="Complete learning missions and maintain streaks to unlock achievements!"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENT_DEFS.map((def, i) => {
            const unlocked = unlockedCodes.has(def.code);
            const achievement = achievements.find((a) => a.code === def.code);
            const Icon = iconMap[def.icon] ?? Award;
            return (
              <motion.div
                key={def.code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card hover className={cn(!unlocked && 'opacity-60')}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                      unlocked ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
                    )}>
                      {unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-sm">{def.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{def.description}</p>
                      {unlocked && achievement && (
                        <p className="text-xs text-accent-500 mt-1.5 font-medium">
                          Unlocked {new Date(achievement.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
