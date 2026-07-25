import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsLoading(true);
      await registerUser({ name: data.name, email: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
          <h1 className="text-lg font-semibold text-foreground">Create account</h1>
          <p className="text-sm text-secondary-foreground mt-1">All data stays in your browser — no servers.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">{error}</div>
          )}

          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-medium text-foreground">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              placeholder="Your name"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
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
              autoComplete="new-password"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              placeholder="at least 6 characters"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              placeholder="repeat password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-foreground text-background text-sm font-medium py-2.5 hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-secondary-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground underline underline-offset-2 hover:no-underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
