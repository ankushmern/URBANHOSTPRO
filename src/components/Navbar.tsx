import React, { useState, useEffect, useRef } from 'react';
import { CookMantraLogo } from './CookMantraLogo';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenBooking: () => void;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onLogout?: () => void;
  onToggleSidebar: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isLoggedIn?: boolean;
  userRole?: 'user' | 'admin';
  userName?: string;
  bookingsCount?: number;
  savedCount?: number;
  dishesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  onOpenBooking,
  onOpenProfile,
  onOpenAuth,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onLogout,
  onToggleSidebar,
  darkMode,
  setDarkMode,
  isLoggedIn = false,
  userRole = 'user',
  userName = 'Mikasa',
  bookingsCount = 0,
  savedCount = 0,
  dishesCount = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeReload = () => {
    setActiveSection('homeSection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'homeSection', label: 'Home' },
    { id: 'dashboardSection', label: 'Orders' },
    { id: 'coursesSection', label: 'Dishes' },
    { id: 'weeklyPrepSection', label: 'Weekly Prep' },
    { id: 'savedRecipesSection', label: 'Wishlist' },
    ...(userRole === 'admin' ? [{ id: 'adminSection', label: '👑 Admin Panel' }] : []),
  ];

  return (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 border-b border-zinc-200 dark:border-[#2D2D30] bg-white/95 dark:bg-[#161618]/95 backdrop-blur-md sticky top-0 z-50 gap-3 transition-colors shadow-xs">
      <div className="flex items-center justify-between w-full md:w-auto">
        {/* Brand Logo with Click to Reload Home */}
        <div
          className="flex items-center cursor-pointer group py-1"
          onClick={handleHomeReload}
          title="CookMantra - Click to reload Home"
        >
          <CookMantraLogo size="md" showText={true} />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center space-x-2 md:hidden">
          {!isLoggedIn ? (
            <button
              onClick={() => onOpenAuth('signin')}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-bold px-3 py-1.5 rounded-full text-xs shadow-sm transition cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1 rounded-full border border-amber-400 bg-amber-50/50 dark:bg-amber-500/10"
              title="Open Profile"
            >
              <img
                src={localStorage.getItem('cookmantra_user_avatar') || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop"}
                className="w-7 h-7 rounded-full object-cover"
                alt="Profile avatar"
              />
            </button>
          )}

          <button
            onClick={onToggleSidebar}
            className="text-gray-700 dark:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition active:scale-95"
            aria-label="Open menu"
          >
            <i className="fas fa-bars text-lg"></i>
          </button>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex flex-wrap items-center gap-1 lg:gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'homeSection') {
                handleHomeReload();
              } else {
                setActiveSection(item.id);
              }
            }}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSection === item.id
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 font-bold shadow-2xs'
                : 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center space-x-2.5">
        {/* Quick Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition active:scale-95 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          title={darkMode ? 'Switch to Light Theme (Alt+T)' : 'Switch to Dark Theme (Alt+T)'}
        >
          <i className={`fas ${darkMode ? 'fa-sun text-amber-400 text-base' : 'fa-moon text-amber-500 text-base'}`}></i>
        </button>

        {isLoggedIn && onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 relative transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Notifications"
            aria-label={`Notifications (${unreadNotificationsCount} unread)`}
          >
            <i className="fas fa-bell text-lg"></i>
            {(unreadNotificationsCount || 0) > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-gray-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#161618] animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        {!isLoggedIn ? (
          <button
            onClick={() => onOpenAuth('signin')}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-bold px-5 py-2 rounded-full text-sm whitespace-nowrap shadow-sm hover:shadow transition transform active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <i className="fas fa-sign-in-alt text-xs"></i>
            <span>Sign In</span>
          </button>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center space-x-2 p-1 pr-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer border border-amber-500/40 hover:border-amber-500 shadow-2xs"
            >
              <img
                src={localStorage.getItem('cookmantra_user_avatar') || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop"}
                className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 bg-zinc-800"
                alt="Profile avatar"
              />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 hidden lg:inline">{userName}</span>
              <i className="fas fa-chevron-down text-xs text-amber-500"></i>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/80">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{userName}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <i className="fas fa-user-circle text-amber-500"></i> My Profile
                </button>
                <button
                  onClick={() => {
                    setDarkMode(prev => !prev);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <i className={`fas ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-amber-500'}`}></i>
                    <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {darkMode ? 'Light' : 'Dark'}
                  </span>
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700/80"></div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

