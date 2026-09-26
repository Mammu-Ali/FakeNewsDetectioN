import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 rounded-md lg:hidden text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu size={24} />
      </button>

      <div className="flex items-center justify-end flex-1 gap-4 sm:gap-6">
        <button className="relative p-2 rounded-full text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">View notifications</span>
          <Bell size={20} />
          {/* Notification dot */}
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User profile dropdown */}
        <div className="relative pl-4 border-l border-slate-200" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-indigo-600 rounded-full">
              {user?.avatar || 'U'}
            </div>
            <div className="hidden sm:flex sm:items-center sm:gap-1 hover:text-indigo-600 transition-colors">
              <span className="text-sm font-medium text-slate-700">{user?.name || 'User'}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200 divide-y divide-slate-100">
              <div className="px-4 py-3">
                <p className="text-sm text-slate-900 truncate font-medium">{user?.name}</p>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <User className="mr-3 h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                  Settings
                </Link>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-4 w-4 text-red-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
