import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-light text-foreground mb-4">404</p>
        <p className="text-sm text-secondary-foreground mb-6">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-foreground underline underline-offset-2 hover:no-underline"
        >
          <FiArrowLeft className="h-3 w-3" /> Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
