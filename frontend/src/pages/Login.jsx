import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsLoading(true);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-secondary-foreground hover:text-foreground transition-colors mb-6">
            <FiArrowLeft className="h-3 w-3" /> back
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
          <p className="text-sm text-secondary-foreground mt-1">Enter your email and password to continue.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">{error}</div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-foreground">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              placeholder="password"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-secondary-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-foreground underline underline-offset-2 hover:no-underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
