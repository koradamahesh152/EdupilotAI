import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function SignupPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password);
    setLoading(false);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Account created! Welcome to EduPilot AI.', 'success');
      navigate('/onboarding');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start your personalized learning journey today">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              {...register('fullName')}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && <p className="text-xs text-error-500 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              {...register('email')}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-xs text-error-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-xs text-error-500 mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-500 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
