
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, LogOut, User, Menu, X, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
    { icon: User, label: 'Prospects', path: '/prospects' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  const NavItem = ({ icon: Icon, label, path, active }: any) => (
      <button
          onClick={() => navigate(path)}
          className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group relative",
              active 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          )}
      >
          <Icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
          <span className="font-medium transition-all duration-300 whitespace-nowrap w-auto opacity-100">
              {label}
          </span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                <span className="font-bold text-white text-lg">S</span>
             </div>
             <span className="font-bold text-xl text-slate-900 whitespace-nowrap">
                SBC Admin
             </span>
             <button onClick={() => setIsMobileOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
             </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
                <NavItem 
                    key={item.path}
                    icon={item.icon} 
                    label={item.label} 
                    path={item.path} 
                    active={location.pathname === item.path} 
                />
            ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Se déconnecter"
            >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="font-medium whitespace-nowrap">
                    Se déconnecter
                </span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMobileOpen(true)}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-slate-800">
                    {navItems.find(i => i.path === location.pathname)?.label || 'Tableau de bord'}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
                        {user?.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.username || 'Admin'}</span>
                </div>
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto w-full">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};
