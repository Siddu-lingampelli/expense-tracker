import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-md px-4 py-2 hover:bg-secondary transition-colors"
        >
          Go to dashboard <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="mb-6">
          <span className="text-5xl font-light tracking-tighter text-foreground">$</span>
          <span className="text-5xl font-light tracking-tighter text-foreground ml-1">monitor</span>
        </div>
        <p className="text-secondary-foreground text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          A simple expense tracker. No accounts, no cloud — everything stays in your browser.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-foreground text-background text-sm font-medium rounded-md px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            Get started <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground border border-border rounded-md px-5 py-2.5 hover:bg-secondary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
