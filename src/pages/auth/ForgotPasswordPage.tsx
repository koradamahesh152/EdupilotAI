import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast(error, 'error');
    } else {
      setSent(true);
      toast('Password reset link sent to your email', 'success');
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send you a link to reset your password">
      {sent ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 mb-6">Check your email for a password reset link.</p>
          <Link to="/login">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Remembered your password?{' '}
        <Link to="/login" className="text-brand-500 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
