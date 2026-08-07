import React, { useState, useEffect } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  isNewAccount?: boolean;
  onSaveSuccess?: (updatedProfile: { name: string; email: string; location: string; phone: string }) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  isNewAccount = false,
  onSaveSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('cookmantra_user_avatar') || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=500&auto=format&fit=crop';
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('cookmantra_profile_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: 'Mikasa Ackerman',
      email: 'mikasarajput@email.com',
      location: 'Mahalgaon, Maharashtra',
      phone: '9876543210',
      totalBookings: '12',
      memberSince: 'January 2026',
      isEmailVerified: true,
      isPhoneVerified: true,
    };
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    location?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setPasswordMsg(null);
      fetchUserProfile();
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const res = await fetch('/api/v1/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setProfile({
          name: data.user.name || '',
          email: data.user.email || '',
          location: data.user.location || 'Maharashtra, India',
          phone: data.user.phone || '',
          totalBookings: data.user.totalBookings || 0,
          memberSince: 'July 2026',
          isEmailVerified: Boolean(data.user.isEmailVerified),
          isPhoneVerified: Boolean(data.user.isPhoneVerified),
        });
        if (data.user.avatar) {
          setAvatarUrl(data.user.avatar);
          localStorage.setItem('cookmantra_user_avatar', data.user.avatar);
        }
      }
    } catch (e) {
      console.warn('Profile fetch error', e);
    }
  };

  if (!isOpen) return null;

  const calculateCompletion = () => {
    let score = 0;
    if (profile.name) score += 25;
    if (profile.phone) score += 25;
    if (profile.email) score += 25;
    if (avatarUrl) score += 25;
    return score;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        localStorage.setItem('cookmantra_user_avatar', result);
        saveAvatarToBackend(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=500&auto=format&fit=crop';
    setAvatarUrl(defaultAvatar);
    localStorage.removeItem('cookmantra_user_avatar');
    saveAvatarToBackend('');
  };

  const saveAvatarToBackend = async (imgStr: string) => {
    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: imgStr }),
      });
    } catch (e) {
      /* ignore */
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!profile.name.trim()) newErrors.name = 'Full Name is required';
    if (!profile.phone.trim()) newErrors.phone = 'Phone Number is required';
    if (!profile.email.trim()) newErrors.email = 'Email Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const res = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          avatar: avatarUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('cookmantra_profile_data', JSON.stringify(profile));
        localStorage.setItem('cookmantra_user_name', profile.name);
        if (onSaveSuccess) onSaveSuccess(profile);
        setIsEditing(false);
      }
    } catch (err) {
      console.warn('Save profile error', err);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const res = await fetch('/api/v1/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Password change failed' });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: 'Server error while changing password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const completionPct = calculateCompletion();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181b] rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto relative shadow-2xl border border-zinc-200 dark:border-zinc-800 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-zinc-800/90 text-gray-700 dark:text-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-zinc-700 transition cursor-pointer"
          aria-label="Close modal"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Cover Header */}
        <div className="relative h-44 sm:h-52 overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-35 mix-blend-overlay"
            alt="Header Cover"
          />
          <div className="absolute -bottom-10 left-6 sm:left-8 group">
            <img
              src={avatarUrl}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#18181b] object-cover shadow-xl bg-zinc-800"
              alt="Profile avatar"
            />
            <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <i className="fas fa-camera text-base"></i>
              <span className="text-[9px] font-bold mt-0.5">Upload Photo</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="absolute bottom-3 right-6 flex gap-2">
            <label className="bg-white/90 dark:bg-zinc-800/90 hover:bg-white text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5">
              <i className="fas fa-camera text-amber-500"></i>
              <span>Change Photo</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <button
              onClick={handleRemoveAvatar}
              className="bg-black/60 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Remove profile photo"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>

        <div className="pt-14 pb-8 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{profile.name || 'User Profile'}</h2>
                <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Gold Diner
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{profile.email}</p>
                {profile.isEmailVerified && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Profile Completion Meter */}
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profile Completion</p>
              <p className="text-lg font-black text-amber-500">{completionPct}%</p>
              <div className="w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-1 mx-auto">
                <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${completionPct}%` }}></div>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 mt-6 gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 transition cursor-pointer ${
                activeTab === 'details' ? 'border-b-2 border-amber-500 text-amber-500 font-extrabold' : 'text-gray-500'
              }`}
            >
              Account Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 transition cursor-pointer ${
                activeTab === 'security' ? 'border-b-2 border-amber-500 text-amber-500 font-extrabold' : 'text-gray-500'
              }`}
            >
              Security & Password
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'details' ? (
              isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-gray-800 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold rounded-xl text-sm transition cursor-pointer shadow-md"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs font-bold text-gray-500 uppercase">Phone Number</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{profile.phone}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs font-bold text-gray-500 uppercase">Email Address</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{profile.email}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs font-bold text-gray-500 uppercase">Total Completed Bookings</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{profile.totalBookings} Bookings</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs font-bold text-gray-500 uppercase">Member Since</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{profile.memberSince}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold rounded-xl text-sm transition cursor-pointer shadow-sm"
                  >
                    Edit Profile Details
                  </button>
                </div>
              )
            ) : (
              /* Security / Change Password Tab */
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                {passwordMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold rounded-xl text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {changingPassword ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-key"></i>}
                  <span>Update Password</span>
                </button>
              </form>
            )}
          </div>

          {onLogout && (
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={onLogout}
                className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <i className="fas fa-sign-out-alt"></i> Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
