import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FiDollarSign, FiPieChart, FiTag, FiUser, FiLogOut, FiMenu, FiX, FiGrid } from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: FiGrid },
  { name: 'Transactions', href: '/dashboard/transactions', icon: FiDollarSign },
  { name: 'Analytics', href: '/dashboard/analytics', icon: FiPieChart },
  { name: 'Categories', href: '/dashboard/categories', icon: FiTag },
  { name: 'Profile', href: '/dashboard/profile', icon: FiUser },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-56 bg-white border-r border-border">
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <Link to="/dashboard" className="text-sm font-semibold tracking-tight">$ monitor</Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-secondary-foreground/50 hover:text-foreground">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive ? 'bg-secondary text-foreground font-medium' : 'text-secondary-foreground hover:bg-secondary/60'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-sm font-semibold tracking-tight text-foreground">
                $ monitor
              </Link>
              <nav className="hidden md:flex items-center gap-0.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      `px-3 py-1.5 text-sm rounded-md transition-colors ${
                        isActive ? 'bg-secondary text-foreground font-medium' : 'text-secondary-foreground hover:text-foreground hover:bg-secondary/60'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 border-r border-border pr-2">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-foreground">{user?.name || 'User'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-secondary-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                title="Sign out"
              >
                <FiLogOut className="h-4 w-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-md text-secondary-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <FiMenu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
