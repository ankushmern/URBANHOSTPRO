import React, { useState, useEffect } from 'react';
import { CookMantraLogo } from './CookMantraLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onLoginSuccess?: (user: { name: string; phone?: string; email?: string; role?: 'user' | 'admin'; isNewAccount?: boolean }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onLoginSuccess,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [formType, setFormType] = useState<'signin' | 'signup' | 'forgot' | 'otp' | 'reset'>(initialMode);
  const [loggedIn, setLoggedIn] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync formType and show front options card when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormType(initialMode);
      setIsFlipped(false);
      setLoggedIn(false);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  // Sign In States
  const [siMobile, setSiMobile] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign Up States
  const [suName, setSuName] = useState('');
  const [suMobile, setSuMobile] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suTerms, setSuTerms] = useState(false);

  // Forgot Password & OTP States
  const [forgotContact, setForgotContact] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [otpNotice, setOtpNotice] = useState<string>('');
  const [otpTokenVerified, setOtpTokenVerified] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  if (!isOpen) return null;

  // Validation checks
  const isSiValid = /^[0-9]{10}$/.test(siMobile) && siPassword.length >= 6;
  const isSuValid =
    suName.trim().length >= 2 &&
    /^[0-9]{10}$/.test(suMobile) &&
    suPassword.length >= 6 &&
    suPassword === suConfirm &&
    suTerms;

  const openForm = (type: 'signin' | 'signup' | 'forgot' | 'otp' | 'reset') => {
    setFormType(type);
    setIsFlipped(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const goBack = () => {
    setIsFlipped(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setter(digitsOnly);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSiValid) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: siMobile, password: siPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('cookmantra_jwt_token', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('cookmantra_refresh_token', data.refreshToken);
      }
      if (data.csrfToken) {
        localStorage.setItem('csrfToken', data.csrfToken);
      }

      const nameToUse = data.user?.name || 'CookMantra Guest';
      const userRole = data.user?.role || 'user';

      localStorage.setItem('cookmantra_user_role', userRole);
      setWelcomeUser(nameToUse);
      setLoggedIn(true);

      if (onLoginSuccess) {
        onLoginSuccess({
          name: nameToUse,
          phone: siMobile,
          email: data.user?.email,
          role: userRole,
        });
      }

      setTimeout(() => {
        setLoggedIn(false);
        setIsFlipped(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage('Network error during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuValid) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suName,
          phone: suMobile,
          email: suEmail,
          password: suPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Registration failed. Please check your details.');
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('cookmantra_jwt_token', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('cookmantra_refresh_token', data.refreshToken);
      }
      if (data.csrfToken) {
        localStorage.setItem('csrfToken', data.csrfToken);
      }

      const userRole = data.user?.role || 'user';
      localStorage.setItem('cookmantra_user_role', userRole);
      setWelcomeUser(suName);
      setLoggedIn(true);

      if (onLoginSuccess) {
        onLoginSuccess({
          name: suName,
          phone: suMobile,
          email: suEmail,
          role: userRole,
          isNewAccount: true,
        });
      }

      setTimeout(() => {
        setLoggedIn(false);
        setIsFlipped(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage('Network error during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startOtpCountdown = () => {
    setOtpTimer(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotContact.trim()) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: /^\d+$/.test(forgotContact.replace(/\D/g, '')) ? forgotContact : undefined,
          email: forgotContact.includes('@') ? forgotContact : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Account not found for reset.');
        setIsLoading(false);
        return;
      }

      setFormType('otp');
      const demoCode = data.otpDemo || '849201';
      setOtpNotice(`OTP sent to ${forgotContact}! (Demo OTP: ${demoCode})`);
      setOtpDigits(demoCode.split('').slice(0, 6));
      startOtpCountdown();
    } catch (err) {
      setErrorMessage('Failed to send OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 4) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: /^\d+$/.test(forgotContact.replace(/\D/g, '')) ? forgotContact : undefined,
          email: forgotContact.includes('@') ? forgotContact : undefined,
          otpToken: code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Invalid or expired OTP code.');
        setIsLoading(false);
        return;
      }

      setOtpTokenVerified(code);
      setFormType('reset');
      setSuccessMessage('OTP verified! Enter your new password below.');
    } catch (err) {
      setErrorMessage('Failed to verify OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6 || newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords must match and be at least 6 characters long.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: /^\d+$/.test(forgotContact.replace(/\D/g, '')) ? forgotContact : undefined,
          email: forgotContact.includes('@') ? forgotContact : undefined,
          otpToken: otpTokenVerified || otpDigits.join(''),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to reset password.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Password reset successfully! Redirecting to Sign In...');
      setTimeout(() => {
        setFormType('signin');
        setSiMobile(forgotContact.replace(/\D/g, ''));
        setSiPassword('');
        setErrorMessage('');
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setErrorMessage('Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-30 bg-white dark:bg-[#252528] text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 text-base w-9 h-9 flex items-center justify-center rounded-full shadow-xl border border-zinc-200 dark:border-zinc-700 transition cursor-pointer active:scale-95"
          aria-label="Close modal"
        >
          <i className="fas fa-times"></i>
        </button>

        {loggedIn ? (
          <div className="bg-white dark:bg-[#18181b] rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Welcome to CookMantra!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Signed in as <span className="font-bold text-amber-500">{welcomeUser}</span>
            </p>
            <p className="text-xs text-gray-400">Redirecting to your culinary experience...</p>
          </div>
        ) : (
          <div className={`flip-card w-full ${isFlipped ? 'flipped' : ''}`}>
            <div className="flip-card-inner">
              {/* FRONT FACE */}
              <div className="flip-card-face bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="relative h-56 overflow-hidden bg-zinc-950">
                  <img
                    src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop"
                    className="w-full h-full object-cover object-[center_25%] transform hover:scale-105 transition-transform duration-700"
                    alt="Professional CookMantra Executive Chef"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex items-end p-6">
                    <div>
                      <span className="inline-block bg-amber-500 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5 shadow-sm">
                        Professional Culinary Platform
                      </span>
                      <h2 className="text-white text-2xl font-black tracking-tight">CookMantra Executive Services</h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 text-center space-y-5">
                  <div className="flex justify-center">
                    <CookMantraLogo size="lg" showText={true} />
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => openForm('signin')}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 py-3 rounded-xl font-bold shadow-md transition cursor-pointer text-sm transform active:scale-98"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => openForm('signup')}
                      className="w-full border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 py-2.5 rounded-xl font-bold transition cursor-pointer text-sm transform active:scale-98"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>

              {/* BACK FACE (FLIP SIDE) */}
              <div className="flip-card-face flip-card-back bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800">
                <div className="max-h-[80vh] overflow-y-auto pr-1">
                  <div className="flex justify-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                    <CookMantraLogo size="sm" showText={true} />
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                      <i className="fas fa-check-circle"></i>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {formType === 'signin' ? (
                    /* SIGN IN SECTION */
                    <div id="signin-section" className="animate-in fade-in duration-200">
                      <h2 className="text-2xl font-bold text-center mb-5 text-gray-900 dark:text-white">Sign In</h2>
                      <form onSubmit={handleSignInSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={siMobile}
                            onChange={(e) => handleMobileChange(e, setSiMobile)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter 10 digit mobile number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Password
                          </label>
                          <input
                            type="password"
                            required
                            value={siPassword}
                            onChange={(e) => setSiPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter password (min 6 chars)"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!isSiValid || isLoading}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 py-3 rounded-xl font-bold transition text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 mt-2 flex items-center justify-center gap-2"
                        >
                          {isLoading && <i className="fas fa-spinner fa-spin"></i>}
                          Login
                        </button>
                      </form>

                      <div className="mt-4 text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => openForm('forgot')}
                          className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer block w-full"
                        >
                          Forgot Password?
                        </button>
                        <button
                          type="button"
                          onClick={() => openForm('signup')}
                          className="text-xs text-gray-600 dark:text-gray-400 font-medium hover:underline cursor-pointer block w-full"
                        >
                          Don't have an account? Register / Sign Up
                        </button>
                      </div>
                    </div>
                  ) : formType === 'forgot' ? (
                    /* FORGOT PASSWORD SECTION */
                    <div id="forgot-section" className="animate-in fade-in duration-200">
                      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Reset Password</h2>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-5">
                        Enter your registered mobile number or email address to receive a 6-digit OTP code.
                      </p>
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Mobile Number / Email
                          </label>
                          <input
                            type="text"
                            required
                            value={forgotContact}
                            onChange={(e) => setForgotContact(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="Enter mobile or email address"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 py-3 rounded-xl font-bold transition text-sm shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                        >
                          {isLoading && <i className="fas fa-spinner fa-spin"></i>}
                          Send OTP Code
                        </button>
                      </form>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setFormType('signin')}
                          className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </div>
                  ) : formType === 'otp' ? (
                    /* OTP VERIFICATION SECTION */
                    <div id="otp-section" className="animate-in fade-in duration-200 text-center">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">OTP Verification</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{otpNotice || 'Enter code sent to your contact'}</p>

                      <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="flex justify-center items-center gap-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`otp-input-${idx}`}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-black rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition shadow-inner"
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs px-2 text-gray-500 dark:text-gray-400">
                          <span>
                            {canResend ? (
                              <button
                                type="button"
                                onClick={startOtpCountdown}
                                className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                              >
                                Resend OTP
                              </button>
                            ) : (
                              <span>Resend in <strong className="text-amber-500">{otpTimer}s</strong></span>
                            )}
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 py-3 rounded-xl font-bold transition text-sm shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                        >
                          {isLoading && <i className="fas fa-spinner fa-spin"></i>}
                          Verify OTP
                        </button>
                      </form>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setFormType('signin')}
                          className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </div>
                  ) : formType === 'reset' ? (
                    /* RESET PASSWORD SECTION */
                    <div id="reset-section" className="animate-in fade-in duration-200">
                      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">New Password</h2>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-5">
                        Set a secure new password for your account.
                      </p>
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="Min 6 characters"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="Re-enter new password"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading || newPassword.length < 6}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 py-3 rounded-xl font-bold transition text-sm shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                        >
                          {isLoading && <i className="fas fa-spinner fa-spin"></i>}
                          Update Password
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* SIGN UP SECTION */
                    <div id="signup-section" className="animate-in fade-in duration-200">
                      <h2 className="text-2xl font-bold text-center mb-5 text-gray-900 dark:text-white">Registration</h2>
                      <form onSubmit={handleSignUpSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={suName}
                            onChange={(e) => setSuName(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={suMobile}
                            onChange={(e) => handleMobileChange(e, setSuMobile)}
                            className="w-full px-3.5 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="Enter 10 digit mobile number"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            value={suEmail}
                            onChange={(e) => setSuEmail(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="email@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Password
                          </label>
                          <input
                            type="password"
                            required
                            value={suPassword}
                            onChange={(e) => setSuPassword(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="Minimum 6 characters"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            required
                            value={suConfirm}
                            onChange={(e) => setSuConfirm(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
                            placeholder="Confirm password"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={suTerms}
                            onChange={(e) => setSuTerms(e.target.checked)}
                            className="rounded accent-amber-500 w-4 h-4"
                          />
                          I agree to terms & privacy policy
                        </label>

                        <button
                          type="submit"
                          disabled={!isSuValid || isLoading}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 py-3 rounded-xl font-bold transition text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 mt-2 flex items-center justify-center gap-2"
                        >
                          {isLoading && <i className="fas fa-spinner fa-spin"></i>}
                          Sign Up
                        </button>
                      </form>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => openForm('signin')}
                          className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Already have an account? Sign In
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BACK BUTTON TO FLIP BACK TO FRONT */}
                  <button
                    onClick={goBack}
                    className="w-full mt-5 text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    ← Back to Welcome
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
