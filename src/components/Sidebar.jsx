import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  History as HistoryIcon, 
  Database, 
  Activity, 
  User, 
  Settings, 
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Predict News', path: '/predict', icon: Search },
  { name: 'History', path: '/history', icon: HistoryIcon },
  { name: 'Model & Dataset', path: '/model-dataset', icon: Database },
  { name: 'Performance', path: '/performance', icon: Activity },
];

const bottomNavItems = [
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck size={28} className="stroke-[2.5]" />
            <span className="text-xl font-bold tracking-tight text-slate-900">TruthGuard</span>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-1 -mr-2 rounded-md lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 py-4 overflow-y-auto">
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon size={20} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="px-3 mt-8 space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon size={20} />
                  {item.name}
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Backend Status Indicator */}
        <div className="p-4 border-t border-slate-200">
          <BackendStatus />
        </div>
      </aside>
    </>
  );
}

// Separate component to handle the async check
import { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

function BackendStatus() {
  const [status, setStatus] = useState('Checking...');
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth();
        setStatus('Online');
        setIsOnline(true);
      } catch (err) {
        setStatus('Offline');
        setIsOnline(false);
      }
    };
    check();
    // Recheck every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500 font-medium tracking-wide uppercase">Backend</span>
      <div className="flex items-center gap-1.5 font-medium">
        {isOnline ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-green-700">Online</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span className="text-red-700">Offline</span>
          </>
        )}
      </div>
    </div>
  );
}
