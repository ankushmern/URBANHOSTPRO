import React from 'react';
import { CookMantraLogo } from './CookMantraLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onLogout?: () => void;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn?: boolean;
  userRole?: 'user' | 'admin';
  userName?: string;
  bookingsCount?: number;
  savedCount?: number;
  dishesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeSection,
  setActiveSection,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  darkMode,
  setDarkMode,
  isLoggedIn = false,
  userRole = 'user',
  userName = 'Mikasa Ackerman',
  bookingsCount = 0,
  savedCount = 0,
  dishesCount = 0,
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'homeSection', label: 'Home', icon: 'fa-home' },
    { id: 'dashboardSection', label: 'Orders & Dashboard', icon: 'fa-chart-pie' },
    { id: 'coursesSection', label: 'Gourmet Dishes', icon: 'fa-utensils' },
    { id: 'weeklyPrepSection', label: 'Weekly Prep', icon: 'fa-calendar-alt' },
    { id: 'savedRecipesSection', label: 'My Wishlist', icon: 'fa-heart' },
    ...(userRole === 'admin' ? [{ id: 'adminSection', label: '👑 Admin Control Panel', icon: 'fa-crown' }] : []),
  ];

  const handleNavClick = (id: string) => {
    if (id === 'homeSection') {
      setActiveSection('homeSection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveSection(id);
    }
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
      ></div>
      <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-[#121214] shadow-2xl z-50 flex flex-col rounded-r-3xl overflow-hidden animate-in slide-in-from-left duration-300 border-r border-gray-200 dark:border-zinc-800/80">
        {/* Top Brand Header */}
        <div className="bg-gradient-to-r from-gray-950 via-zinc-900 to-amber-950 p-5 relative text-white border-b border-zinc-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close menu"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
          
          <div className="pt-1 cursor-pointer" onClick={() => handleNavClick('homeSection')}>
            <CookMantraLogo size="lg" showText={true} variant="light" />
          </div>
        </div>

        {/* User Profile Summary - ONLY WHEN LOGGED IN */}
        {isLoggedIn ? (
          <div className="p-3.5 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/70 dark:bg-zinc-900/40">
            <button
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="flex items-center justify-between w-full p-2 rounded-2xl hover:bg-white dark:hover:bg-zinc-800/80 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700/60 transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={localStorage.getItem('cookmantra_user_avatar') || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop"}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500 group-hover:scale-105 transition-transform bg-zinc-800"
                    alt={userName}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1 truncate">
                    <span className="truncate">{userName}</span>
                    <i className="fas fa-check-circle text-amber-500 text-[10px] flex-shrink-0"></i>
                  </p>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
                      <i className="fas fa-crown text-[8px] text-amber-500"></i> Gold VIP Member
                    </span>
                  </div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2"></i>
            </button>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800/80 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
            <p className="font-bold flex items-center gap-1.5">
              <i className="fas fa-user-circle text-amber-500 text-sm"></i> Welcome, Guest!
            </p>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
              Sign in to manage orders, view your profile & book private chefs.
            </p>
          </div>
        )}

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-gray-950 font-extrabold shadow-md shadow-amber-500/20 scale-[1.01]'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800/80 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                <i className={`fas ${item.icon} w-5 text-center text-sm ${isActive ? 'text-gray-950' : 'text-gray-400 dark:text-zinc-500'}`}></i>
                <span className="text-xs tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Settings & Theme Controls */}
        <div className="border-t border-gray-100 dark:border-zinc-800/80 p-4 space-y-3 bg-gray-50/30 dark:bg-zinc-900/20">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                <i className={`fas ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {darkMode ? 'Dark Appearance' : 'Light Appearance'}
              </span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer" htmlFor="sidebar-theme-toggle" title="Toggle Light / Dark Mode">
              <input
                type="checkbox"
                id="sidebar-theme-toggle"
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(prev => !prev)}
                role="switch"
                aria-label="Toggle dark mode"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-amber-600 rounded-full shadow-inner transition-colors peer-checked:bg-amber-500 relative">
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform flex items-center justify-center text-[10px] shadow-sm ${darkMode ? 'translate-x-5 text-amber-600' : 'translate-x-0 text-amber-500'}`}>
                  <i className={`fas ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
                </div>
              </div>
            </label>
          </div>

          {!isLoggedIn ? (
            <button
              onClick={() => {
                onClose();
                onOpenAuth('signin');
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-gray-950 bg-amber-500 hover:bg-amber-600 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <i className="fas fa-sign-in-alt text-xs"></i>
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all cursor-pointer active:scale-98"
            >
              <i className="fas fa-sign-out-alt text-xs"></i>
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

