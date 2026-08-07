import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeSection } from './components/HomeSection';
import { BookingModal } from './components/BookingModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { NotificationCenter } from './components/NotificationCenter';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast, ToastType } from './components/Toast';
import { SectionLoadingSkeleton } from './components/LoadingSkeleton';
import { NotFoundSection } from './components/NotFoundSection';
import { INITIAL_RECIPES, INITIAL_BOOKINGS } from './data/recipes';
import { Booking, Recipe, NotificationItem } from './types';
import { mapServerBookingToClient } from './utils/bookingMapper';

// Code-Splitting with Dynamic Imports for Performance Optimization
const DashboardSection = lazy(() => import('./components/DashboardSection').then(m => ({ default: m.DashboardSection })));
const DishesSection = lazy(() => import('./components/DishesSection').then(m => ({ default: m.DishesSection })));
const WeeklyPrepSection = lazy(() => import('./components/WeeklyPrepSection').then(m => ({ default: m.WeeklyPrepSection })));
const WishlistSection = lazy(() => import('./components/WishlistSection').then(m => ({ default: m.WishlistSection })));
const AdminSection = lazy(() => import('./components/AdminSection').then(m => ({ default: m.AdminSection })));
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./components/legal/TermsOfService').then(m => ({ default: m.TermsOfService })));
const CancellationPolicy = lazy(() => import('./components/legal/CancellationPolicy').then(m => ({ default: m.CancellationPolicy })));

export default function App() {
  const [activeSection, setActiveSection] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/privacy-policy') return 'privacyPolicySection';
    if (path === '/terms-of-service') return 'termsOfServiceSection';
    if (path === '/cancellation-policy') return 'cancellationPolicySection';
    return 'homeSection';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/privacy-policy') setActiveSection('privacyPolicySection');
      else if (path === '/terms-of-service') setActiveSection('termsOfServiceSection');
      else if (path === '/cancellation-policy') setActiveSection('cancellationPolicySection');
      else if (path === '/' || path === '') setActiveSection('homeSection');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      _id: 'notif-1',
      title: 'Welcome to CookMantra!',
      message: 'Explore our gourmet dishes and book top-rated private chefs instantly.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'notif-2',
      title: 'Booking Confirmed',
      message: 'Your booking for Home Chef Service has been received successfully.',
      type: 'booking',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');
  const [isNewAccountMode, setIsNewAccountMode] = useState<boolean>(false);
  
  // Authentication & Role State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cookmantra_is_logged_in') === 'true';
  });
  const [userRole, setUserRole] = useState<'user' | 'admin'>(() => {
    return (localStorage.getItem('cookmantra_user_role') as 'user' | 'admin') || 'user';
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('cookmantra_user_name') || 'Mikasa Ackerman';
  });
  const [userPhone, setUserPhone] = useState<string>(() => {
    return localStorage.getItem('cookmantra_user_phone') || '9876543210';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('cookmantra_user_email') || 'mikasarajput@email.com';
  });

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: { name: string; phone?: string; role?: 'user' | 'admin'; isNewAccount?: boolean }) => {
    setIsLoggedIn(true);
    localStorage.setItem('cookmantra_is_logged_in', 'true');

    const uRole = user.role || (user.phone === '9876543210' ? 'admin' : 'user');
    setUserRole(uRole);
    localStorage.setItem('cookmantra_user_role', uRole);

    const uPhone = user.phone || '9876543210';
    setUserPhone(uPhone);
    localStorage.setItem('cookmantra_user_phone', uPhone);

    const uName = user.name || (uRole === 'admin' ? 'CookMantra Admin' : 'Mikasa Ackerman');
    setUserName(uName);
    localStorage.setItem('cookmantra_user_name', uName);

    const uEmail = uRole === 'admin' ? 'admin@cookmantra.com' : `${uPhone}@cookmantra.com`;
    setUserEmail(uEmail);
    localStorage.setItem('cookmantra_user_email', uEmail);

    // Isolate Profile per user
    const profileKey = `cookmantra_profile_${uPhone}`;
    let profileToSave = {
      name: uName,
      email: uEmail,
      location: uRole === 'admin' ? 'CookMantra HQ' : '',
      phone: uPhone,
      totalBookings: '0',
      memberSince: 'July 2026',
    };

    if (!user.isNewAccount) {
      const existingProfileStr = localStorage.getItem(profileKey) || localStorage.getItem('cookmantra_profile_data');
      if (existingProfileStr) {
        try {
          const parsed = JSON.parse(existingProfileStr);
          profileToSave = {
            ...profileToSave,
            ...parsed,
            name: uName,
            phone: uPhone,
          };
        } catch (e) { /* ignore */ }
      }
    }

    localStorage.setItem(profileKey, JSON.stringify(profileToSave));
    localStorage.setItem('cookmantra_profile_data', JSON.stringify(profileToSave));

    // Isolate Wishlist per user
    const savedIdsKey = `cookmantra_saved_ids_${uPhone}`;
    let userSavedIds: number[] = [];
    if (!user.isNewAccount) {
      const existingSaved = localStorage.getItem(savedIdsKey);
      if (existingSaved) {
        try {
          userSavedIds = JSON.parse(existingSaved);
        } catch (e) {
          userSavedIds = [1, 3];
        }
      } else {
        userSavedIds = [1, 3];
      }
    }
    setSavedIds(userSavedIds);
    localStorage.setItem(savedIdsKey, JSON.stringify(userSavedIds));
    localStorage.setItem('cookmantra_saved_ids', JSON.stringify(userSavedIds));

    if (user.isNewAccount) {
      setIsNewAccountMode(true);
      setProfileModalOpen(true);
      showToast(`🎉 Account created! Please complete your profile details.`);
    } else {
      setIsNewAccountMode(false);
      showToast(`✅ Welcome back, ${uName}! (${uRole.toUpperCase()} Mode)`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('user');
    setUserName('Guest');
    setUserPhone('');
    setUserEmail('');
    localStorage.setItem('cookmantra_is_logged_in', 'false');
    localStorage.setItem('cookmantra_user_role', 'user');
    localStorage.setItem('cookmantra_user_name', 'Guest');
    localStorage.setItem('cookmantra_user_phone', '');
    localStorage.setItem('cookmantra_user_email', '');
    localStorage.removeItem('cookmantra_jwt_token');
    setSavedIds([]);
    setProfileModalOpen(false);
    showToast('Signed out successfully.');
  };

  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    itemTitle: string;
    amount: string;
    bookingId?: string;
  } | null>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<{
    serviceDetail: string;
    serviceType?: string;
    price?: string;
  } | null>(null);

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (msg: string, type: ToastType = 'info') => {
    setToast({ message: msg, type });
  };

  // Live Bookings state initialized from INITIAL_BOOKINGS
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('cookmantra_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_BOOKINGS;
  });

  // Live Recipes / Dishes state initialized from INITIAL_RECIPES
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('cookmantra_recipes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_RECIPES;
  });

  // Theme preference key
  const STORAGE_KEY = 'theme-preference';

  // Theme state - checks localStorage, color-theme, system preference, or defaults to light
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('color-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme to document element and body
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem(STORAGE_KEY, 'dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      html.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY, 'light');
      localStorage.setItem('color-theme', 'light');
    }
  }, [darkMode]);

  // Keyboard shortcut: Alt + T to toggle dark / light mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setDarkMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // System preference change listener (only if no manual user selection in localStorage)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY) && !localStorage.getItem('color-theme')) {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Saved recipes wishlist array
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('cookmantra_saved_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [1, 3]; // Default demo saved items
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cookmantra_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('cookmantra_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    if (userPhone) {
      localStorage.setItem(`cookmantra_saved_ids_${userPhone}`, JSON.stringify(savedIds));
    }
    localStorage.setItem('cookmantra_saved_ids', JSON.stringify(savedIds));
  }, [savedIds, userPhone]);

  useEffect(() => {
    fetch('/api/v1/bookings')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.bookings) && data.bookings.length > 0) {
          const serverBookings: Booking[] = data.bookings.map((b: any) => mapServerBookingToClient(b));

          setBookings(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = serverBookings.filter(item => !existingIds.has(item.id));
            if (newItems.length > 0) {
              return [...newItems, ...prev];
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Filter bookings for the currently authenticated user (Admin sees all)
  const userBookings = React.useMemo(() => {
    if (userRole === 'admin') {
      return bookings;
    }
    if (!isLoggedIn) {
      return [];
    }
    
    const cleanUserPhone = userPhone ? userPhone.replace(/\D/g, '') : '';
    const lowerUserName = userName ? userName.trim().toLowerCase() : '';
    const lowerUserEmail = userEmail ? userEmail.trim().toLowerCase() : '';

    return bookings.filter(b => {
      if (b.userPhone && userPhone && b.userPhone === userPhone) return true;
      if (b.userEmail && userEmail && b.userEmail === userEmail) return true;

      const cleanBookingPhone = b.phone ? b.phone.replace(/\D/g, '') : '';
      
      const phoneMatch = Boolean(
        cleanUserPhone && 
        cleanBookingPhone && 
        (cleanUserPhone === cleanBookingPhone || cleanBookingPhone.endsWith(cleanUserPhone) || cleanUserPhone.endsWith(cleanBookingPhone))
      );
      
      const nameMatch = Boolean(lowerUserName && lowerUserName !== 'guest' && b.name && b.name.trim().toLowerCase() === lowerUserName);
      const emailMatch = Boolean(lowerUserEmail && b.email && b.email.trim().toLowerCase() === lowerUserEmail);
      
      return phoneMatch || nameMatch || emailMatch;
    });
  }, [bookings, userRole, isLoggedIn, userPhone, userName, userEmail]);

  const addBooking = async (newBookingData: Partial<Booking> & Omit<Booking, 'id'>, openRazorpayDirectly: boolean = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const initialStatus = openRazorpayDirectly ? 'Payment Pending' : 'Payment Verification Pending';
    
    const finalPhone = (newBookingData.phone && newBookingData.phone.trim() !== '') ? newBookingData.phone.trim() : userPhone;
    const finalName = (newBookingData.name && newBookingData.name.trim() !== '' && newBookingData.name !== 'Guest') ? newBookingData.name.trim() : userName;
    const finalEmail = (newBookingData.email && newBookingData.email.trim() !== '') ? newBookingData.email.trim() : userEmail;

    const payload = {
      name: finalName || 'Customer',
      phone: finalPhone || '9876543210',
      email: finalEmail || '',
      serviceType: newBookingData.serviceType || 'culinary',
      serviceDetail: newBookingData.serviceDetail || 'Home Chef Service',
      date: newBookingData.date || todayStr,
      time: newBookingData.time || '19:00',
      notes: newBookingData.notes || '',
      status: initialStatus,
    };

    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        const newBooking = mapServerBookingToClient(
          data.booking,
          userPhone,
          userEmail,
          newBookingData.avatarImg
        );

        setBookings(prev => [newBooking, ...prev]);
        showToast(openRazorpayDirectly ? `Order created! Scan UPI QR & submit UTR for verification.` : `Order created! Pending payment verification.`);
        
        const match = newBooking.serviceDetail.match(/₹[\d,]+/);
        const calculatedAmount = match ? match[0] : '₹1,499';

        if (openRazorpayDirectly) {
          setPaymentDetails({
            itemTitle: newBooking.serviceDetail,
            amount: calculatedAmount,
            bookingId: newBooking.id,
          });
          setPaymentModalOpen(true);
        }
        setActiveSection('dashboardSection');
      } else {
        showToast(`❌ Booking creation failed: ${data.message || 'Server error'}`);
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      showToast('❌ Booking error. Please try again.');
    }
  };

  const handleVerifyBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
    showToast('✅ Money verified in bank! Booking is now Confirmed.');
  };

  const handleRejectBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Payment Failed' } : b));
    showToast('❌ Payment not received. Booking marked as Failed.');
  };

  const handleQuickOrder = async (serviceDetail: string, serviceType: string = 'culinary', price?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const fullTitle = price ? `${serviceDetail} (${price})` : serviceDetail;

    const payload = {
      name: (userName && userName !== 'Guest') ? userName : 'Customer',
      phone: userPhone || '9876543210',
      email: userEmail || '',
      serviceType: serviceType || 'culinary',
      serviceDetail: fullTitle,
      date: todayStr,
      time: '19:30',
      status: 'Payment Pending',
    };

    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        const newBooking = mapServerBookingToClient(data.booking, userPhone, userEmail);

        setBookings(prev => [newBooking, ...prev]);
        showToast(`⚡ Order created! Scan UPI QR & enter 12-digit UTR to complete.`);

        setPaymentDetails({
          itemTitle: fullTitle,
          amount: price || '₹1,499',
          bookingId: newBooking.id,
        });
        setPaymentModalOpen(true);
        setActiveSection('dashboardSection');
      } else {
        showToast(`❌ Quick order failed: ${data.message || 'Server error'}`);
      }
    } catch (err: any) {
      console.error('Quick order error:', err);
      showToast('❌ Quick order error. Please try again.');
    }
  };

  const handleOpenBooking = (serviceDetail?: string, serviceType?: string, price?: string) => {
    if (serviceDetail) {
      setSelectedServiceForBooking({ serviceDetail, serviceType, price });
    } else {
      setSelectedServiceForBooking(null);
    }
    setBookingModalOpen(true);
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    showToast('Booking deleted successfully');
  };

  const addRecipe = (newRecipeData: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...newRecipeData,
      id: Date.now(),
    };
    setRecipes(prev => [newRecipe, ...prev]);
    showToast(`Dish "${newRecipe.name}" added to live menu!`);
  };

  const deleteRecipe = (id: number) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setSavedIds(prev => prev.filter(savedId => savedId !== id));
    showToast('Dish removed from catalog');
  };

  const toggleSavedRecipe = (id: number, dishData?: Partial<Recipe>) => {
    if (dishData && !recipes.some(r => r.id === id)) {
      setRecipes(prev => [
        {
          id,
          name: dishData.name || 'Custom Dish',
          cuisine: dishData.cuisine || 'Indian',
          category: dishData.category || 'Main Course',
          time: dishData.time || '20 min',
          img: dishData.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
        },
        ...prev,
      ]);
    }
    setSavedIds(prev => {
      const isSaved = prev.includes(id);
      if (isSaved) {
        showToast('Removed from Wishlist');
        return prev.filter(recipeId => recipeId !== id);
      } else {
        showToast('❤️ Added to Wishlist!');
        return [...prev, id];
      }
    });
  };

  const KNOWN_SECTIONS = [
    'homeSection',
    'dashboardSection',
    'coursesSection',
    'weeklyPrepSection',
    'savedRecipesSection',
    'adminSection',
    'privacyPolicySection',
    'termsOfServiceSection',
    'cancellationPolicySection',
  ];

  return (
    <ErrorBoundary>
      {/* WCAG Skip-to-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-500 focus:text-gray-950 focus:font-extrabold focus:rounded-xl focus:shadow-2xl focus:outline-hidden"
      >
        Skip to main content
      </a>

      <div className="min-h-screen w-full overflow-x-hidden bg-white text-gray-900 dark:bg-[#0A0A0B] dark:text-zinc-100 transition-colors duration-300 flex flex-col justify-between font-sans relative">
        {/* Real-time Toast Notifications */}
        <Toast
          message={toast?.message || null}
          type={toast?.type || 'info'}
          onClose={() => setToast(null)}
        />

        <div>
          {/* Navigation Bar */}
          <Navbar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onOpenBooking={() => setBookingModalOpen(true)}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenAuth={handleOpenAuth}
            onOpenNotifications={() => setNotificationsOpen(true)}
            unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(true)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            userName={userName}
            bookingsCount={userBookings.length}
            savedCount={savedIds.length}
            dishesCount={recipes.length}
          />

          {/* Mobile Navigation Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            userName={userName}
            bookingsCount={userBookings.length}
            savedCount={savedIds.length}
            dishesCount={recipes.length}
          />

          {/* Main Content Body */}
          <main id="main-content" className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-6 flex-1 focus:outline-hidden">
            <Suspense fallback={<SectionLoadingSkeleton />}>
              {activeSection === 'homeSection' && (
                <HomeSection
                  onOpenBooking={() => handleOpenBooking()}
                  setActiveSection={setActiveSection}
                  onQuickOrder={(detail, type, price) => handleOpenBooking(detail, type, price)}
                />
              )}

              {activeSection === 'dashboardSection' && (
                <DashboardSection
                  onOpenBooking={() => handleOpenBooking()}
                  setActiveSection={setActiveSection}
                  bookings={userBookings}
                  savedCount={savedIds.length}
                  dishesCount={recipes.length}
                  userRole={userRole}
                  onDeleteBooking={deleteBooking}
                  onVerifyBooking={handleVerifyBooking}
                  onRejectBooking={handleRejectBooking}
                  onPayBooking={(b) => {
                    const match = b.serviceDetail.match(/₹[\d,]+/);
                    setPaymentDetails({
                      itemTitle: b.serviceDetail,
                      amount: match ? match[0] : '₹1,499',
                      bookingId: b.id,
                    });
                    setPaymentModalOpen(true);
                  }}
                />
              )}

              {activeSection === 'coursesSection' && (
                <DishesSection
                  onOpenBooking={() => handleOpenBooking()}
                  onQuickOrder={(detail, type, price) => handleOpenBooking(detail, type, price)}
                  savedIds={savedIds}
                  onToggleSaved={toggleSavedRecipe}
                />
              )}

              {activeSection === 'weeklyPrepSection' && <WeeklyPrepSection />}

              {activeSection === 'savedRecipesSection' && (
                <WishlistSection
                  recipes={recipes}
                  savedIds={savedIds}
                  onToggleSaved={toggleSavedRecipe}
                  onAddRecipe={addRecipe}
                  onDeleteRecipe={deleteRecipe}
                  onQuickOrder={(detail, type, price) => handleOpenBooking(detail, type, price)}
                  onBrowseDishes={() => setActiveSection('coursesSection')}
                />
              )}

              {activeSection === 'adminSection' && (
                userRole === 'admin' ? (
                  <AdminSection
                    recipes={recipes}
                    onAddRecipe={addRecipe}
                    onDeleteRecipe={deleteRecipe}
                    bookings={bookings}
                    onVerifyBooking={handleVerifyBooking}
                    onRejectBooking={handleRejectBooking}
                    onDeleteBooking={deleteBooking}
                    showToast={showToast}
                  />
                ) : (
                  <div className="bg-white dark:bg-[#161618] rounded-3xl p-8 border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto shadow-xl my-12 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-rose-500/20">
                      <i className="fas fa-user-lock"></i>
                    </div>
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Admin Access Restricted</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      You are currently signed in as a standard client user (<span className="font-bold">{userName}</span>). Admin privileges are required to view backend analytics and edit menu dishes.
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        onClick={() => setActiveSection('homeSection')}
                        className="px-4 py-2 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl hover:bg-zinc-200 cursor-pointer"
                      >
                        Back to Home
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          handleOpenAuth('signin');
                        }}
                        className="px-5 py-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl shadow-md cursor-pointer"
                      >
                        Login as Admin
                      </button>
                    </div>
                  </div>
                )
              )}

              {activeSection === 'privacyPolicySection' && (
                <PrivacyPolicy
                  onBackToHome={() => {
                    setActiveSection('homeSection');
                    window.history.pushState({}, '', '/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeSection === 'termsOfServiceSection' && (
                <TermsOfService
                  onBackToHome={() => {
                    setActiveSection('homeSection');
                    window.history.pushState({}, '', '/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeSection === 'cancellationPolicySection' && (
                <CancellationPolicy
                  onBackToHome={() => {
                    setActiveSection('homeSection');
                    window.history.pushState({}, '', '/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {/* 404 Route Fallback */}
              {!KNOWN_SECTIONS.includes(activeSection) && (
                <NotFoundSection
                  onGoHome={() => setActiveSection('homeSection')}
                  onExploreDishes={() => setActiveSection('coursesSection')}
                />
              )}
            </Suspense>
          </main>
        </div>

      {/* Footer */}
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6 pb-6">
        <Footer setActiveSection={setActiveSection} />
      </div>

      {/* Floating Book Now Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => handleOpenBooking()}
          className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-950 font-extrabold rounded-full px-4 py-2.5 sm:px-6 sm:py-3.5 shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-2 border-white/80 dark:border-gray-800"
        >
          <i className="fas fa-calendar-check text-sm sm:text-lg"></i>
          <span className="text-xs sm:text-sm font-bold tracking-wide">Book Now</span>
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-600"></span>
          </span>
        </button>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onAddBooking={addBooking}
        initialService={selectedServiceForBooking}
        userName={userName}
        userPhone={userPhone}
        userEmail={userEmail}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setIsNewAccountMode(false);
        }}
        isNewAccount={isNewAccountMode}
        onLogout={handleLogout}
        onSaveSuccess={(updated) => {
          setUserName(updated.name);
          showToast(`✅ Profile details saved!`);
          setIsNewAccountMode(false);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Payment Modal (Direct UPI) */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        bookingDetails={paymentDetails}
        onPaymentSuccess={(method, bookingId, utrNumber) => {
          const isCod = method === 'PAY_ON_ARRIVAL';
          const targetStatus = isCod ? 'Confirmed' : 'Payment Verification Pending';
          if (bookingId) {
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: targetStatus, utrNumber } : b));
          } else {
            setBookings(prev => prev.map((b, idx) => idx === 0 ? { ...b, status: targetStatus, utrNumber } : b));
          }
          if (isCod) {
            showToast(`🎉 Order Confirmed for Cash on Service!`);
          } else {
            showToast(`⏳ UTR ${utrNumber || 'Submitted'} Recorded! Status: Pending Receiver Bank Verification (aankushrajput672@okhdfcbank).`);
          }
          setActiveSection('dashboardSection');
        }}
      />

      {/* In-App Notification Center */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={(id) => {
          setNotifications(prev => prev.map(n => (n._id === id || n.id === id ? { ...n, isRead: true } : n)));
        }}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }}
      />
    </div>
  </ErrorBoundary>
  );
}
