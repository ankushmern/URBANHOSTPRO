import React, { useState } from 'react';
import { Booking } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBooking: (
    booking: Omit<Booking, 'id' | 'createdAt' | 'status'>,
    openRazorpayDirectly?: boolean
  ) => void;
  initialService?: {
    serviceDetail: string;
    serviceType?: string;
    price?: string;
  } | null;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onAddBooking,
  initialService,
  userName = '',
  userPhone = '',
  userEmail = '',
}) => {
  const [serviceType, setServiceType] = useState<string>('culinary');
  const [submitted, setSubmitted] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [showQuantity, setShowQuantity] = useState<boolean>(true);

  const getActiveUserDetail = () => {
    const sName = userName && userName !== 'Guest' ? userName : (localStorage.getItem('cookmantra_user_name') || '');
    const sPhone = userPhone || localStorage.getItem('cookmantra_user_phone') || '';
    const sEmail = userEmail || localStorage.getItem('cookmantra_user_email') || '';
    return { name: sName === 'Guest' ? '' : sName, phone: sPhone, email: sEmail };
  };

  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const get24HourTimeString = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceDetail: 'Home Chef Service',
    date: '',
    time: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    serviceDetail?: string;
    date?: string;
  }>({});

  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setErrors({});
      const todayStr = new Date().toISOString().split('T')[0];
      const activeUser = getActiveUserDetail();

      const liveTimeStr = get24HourTimeString(new Date());

      if (initialService) {
        const fullDetail = initialService.serviceDetail + (initialService.price ? ` (${initialService.price})` : '');
        setFormData(prev => ({
          ...prev,
          name: prev.name || activeUser.name,
          phone: prev.phone || activeUser.phone,
          email: prev.email || activeUser.email,
          serviceDetail: fullDetail,
          date: prev.date || todayStr,
          time: prev.time || liveTimeStr,
        }));
        
        const st = (initialService.serviceType || '').toLowerCase();
        const fd = fullDetail.toLowerCase();
        const isQuantityRelevant = (
          st.includes('combo') || 
          st.includes('package') ||
          fd.includes('masterclass') ||
          fd.includes('bbq') ||
          fd.includes('dish') ||
          fd.includes('thali') ||
          fd.includes('curry') ||
          fd.includes('paneer') ||
          fd.includes('biryani') ||
          fd.includes('₹')
        ) && !fd.includes('single') && !st.includes('clean') && !fd.includes('clean');

        if (st.includes('clean') || fd.includes('clean')) {
          setServiceType('cleaning');
          setShowQuantity(false);
        } else if (st.includes('combo') || st.includes('package')) {
          setServiceType('combo');
          setShowQuantity(true);
        } else {
          setServiceType('culinary');
          setShowQuantity(isQuantityRelevant);
        }
      } else {
        setFormData(prev => ({
          ...prev,
          name: prev.name || activeUser.name,
          phone: prev.phone || activeUser.phone,
          email: prev.email || activeUser.email,
          date: prev.date || todayStr,
          time: prev.time || liveTimeStr,
        }));
        setShowQuantity(serviceType !== 'cleaning');
      }
    }
  }, [isOpen, initialService, userName, userPhone, userEmail]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: {
      name?: string;
      phone?: string;
      email?: string;
      serviceDetail?: string;
      date?: string;
    } = {};

    // 1. Name validation
    const nameVal = formData.name.trim();
    if (!nameVal) {
      newErrors.name = 'Full Name is required (Naam bharna zaroori hai)';
    } else if (nameVal.length < 2) {
      newErrors.name = 'Please enter a valid full name';
    }

    // 2. Phone validation (Strict 10 digits)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = '10-Digit Mobile Number is required (Sirf 10 digit mobile number daliye)';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = `Phone number must be exactly 10 digits. You entered ${cleanPhone.length} digit(s).`;
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.';
    }

    // 3. Email validation
    const emailVal = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      newErrors.email = 'Email Address is required (Email ID bharna zaroori hai)';
    } else if (!emailRegex.test(emailVal)) {
      newErrors.email = 'Please enter a valid email address (e.g. MikasaAckerman@gmail.com)';
    }

    // 4. Service detail validation
    if (!formData.serviceDetail.trim()) {
      newErrors.serviceDetail = 'Selected service or dish is required';
    }

    // 5. Date validation
    if (!formData.date) {
      newErrors.date = 'Preferred booking date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent, openRazorpayDirectly: boolean = false) => {
    if (e) e.preventDefault();

    // STRICT VALIDATION: Do not proceed if validation fails
    if (!validate()) {
      return;
    }

    // Create real-time booking with quantity if applicable
    const finalDetail = (showQuantity && quantity > 1)
      ? `${formData.serviceDetail} [Qty: ${quantity}]`
      : formData.serviceDetail;

    const bookingPayload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      serviceType: serviceType,
      serviceDetail: finalDetail,
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '19:00',
      notes: formData.notes,
    };

    onAddBooking(bookingPayload, openRazorpayDirectly);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({
        name: '',
        phone: '',
        email: '',
        serviceDetail: 'Home Chef Service',
        date: '',
        time: '',
        notes: '',
      });
      setErrors({});
    }, 1800);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181b] rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 relative shadow-2xl border border-zinc-200 dark:border-zinc-800 my-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-lg w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer z-10"
          aria-label="Close modal"
        >
          <i className="fas fa-times"></i>
        </button>

        {submitted ? (
          <div className="py-10 sm:py-12 text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto animate-bounce shadow-inner">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Booking Request Received!</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-xs sm:text-sm leading-relaxed px-2">
              Thank you, <span className="font-semibold text-amber-500">{formData.name || 'Valued Guest'}</span>! Our concierge will call you back within 2 hours to confirm your schedule.
            </p>
          </div>
        ) : (
          <>
            <div className="pr-8 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Book Your Service</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Tell us what you need – our team will confirm within 2 hours.
              </p>
            </div>

            <div className="mb-5 sm:mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold text-xs sm:text-sm">
                Service Type *
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setServiceType('culinary');
                    setShowQuantity(true);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left flex items-center justify-center sm:justify-start gap-2 transition-all text-xs sm:text-sm font-bold cursor-pointer ${
                    serviceType === 'culinary'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-2xs'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <i className="fas fa-utensils text-amber-500 text-xs sm:text-sm"></i>
                  <span>Culinary</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceType('cleaning');
                    setShowQuantity(false);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left flex items-center justify-center sm:justify-start gap-2 transition-all text-xs sm:text-sm font-bold cursor-pointer ${
                    serviceType === 'cleaning'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-2xs'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <i className="fas fa-broom text-blue-500 text-xs sm:text-sm"></i>
                  <span>Cleaning</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceType('combo');
                    setShowQuantity(true);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left flex items-center justify-center sm:justify-start gap-2 transition-all text-xs sm:text-sm font-bold cursor-pointer ${
                    serviceType === 'combo'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 shadow-2xs'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <i className="fas fa-crown text-purple-500 text-xs sm:text-sm"></i>
                  <span>Combo Package</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full min-w-0 px-3.5 sm:px-4 py-2.5 rounded-xl border ${
                      errors.name
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20'
                        : 'border-gray-300 dark:border-zinc-700'
                    } bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="Mikasa Ackerman"
                  />
                  {errors.name && (
                    <p className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle text-[11px]"></i>
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phone}
                    onChange={e => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: digitsOnly });
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    className={`w-full min-w-0 px-3.5 sm:px-4 py-2.5 rounded-xl border ${
                      errors.phone
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20'
                        : 'border-gray-300 dark:border-zinc-700'
                    } bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 font-mono tracking-wider`}
                    placeholder="9876543210"
                  />
                  {errors.phone && (
                    <p className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle text-[11px]"></i>
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full min-w-0 px-3.5 sm:px-4 py-2.5 rounded-xl border ${
                    errors.email
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20'
                      : 'border-gray-300 dark:border-zinc-700'
                  } bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                  placeholder="MikasaAckerman@gmail.com"
                />
                {errors.email && (
                  <p className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle text-[11px]"></i>
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Selected Dish / Service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.serviceDetail}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ ...formData, serviceDetail: val });
                    if (errors.serviceDetail) setErrors(prev => ({ ...prev, serviceDetail: undefined }));
                    const lower = val.toLowerCase();
                    if (lower.includes('clean') || lower.includes('single') || lower.includes('one-time') || lower.includes('consultation')) {
                      setShowQuantity(false);
                    } else if (lower.includes('masterclass') || lower.includes('bbq') || lower.includes('dish') || lower.includes('thali') || lower.includes('combo') || lower.includes('₹') || lower.includes('curry')) {
                      setShowQuantity(true);
                    }
                  }}
                  className={`w-full min-w-0 px-3.5 sm:px-4 py-2.5 rounded-xl border ${
                    errors.serviceDetail
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20'
                      : 'border-gray-300 dark:border-zinc-700'
                  } bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                  placeholder="e.g. CookMantra ₹9 Special Trial Dish"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, serviceDetail: 'CookMantra ₹9 Special Gourmet Trial Dish (₹9)' });
                      setShowQuantity(true);
                      if (errors.serviceDetail) setErrors(prev => ({ ...prev, serviceDetail: undefined }));
                    }}
                    className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    🔥 ₹9 Special Trial Dish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, serviceDetail: 'Paneer Tikka Bowl + Curd (₹159)' });
                      setShowQuantity(true);
                      if (errors.serviceDetail) setErrors(prev => ({ ...prev, serviceDetail: undefined }));
                    }}
                    className="px-2.5 py-1 bg-amber-100 dark:bg-zinc-800 text-amber-900 dark:text-amber-300 rounded-lg text-[10px] sm:text-[11px] font-bold transition hover:bg-amber-200 cursor-pointer"
                  >
                    Paneer Tikka Bowl (₹159)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, serviceDetail: 'Gourmet Home Chef Service (₹1,499)' });
                      setShowQuantity(false);
                      if (errors.serviceDetail) setErrors(prev => ({ ...prev, serviceDetail: undefined }));
                    }}
                    className="px-2.5 py-1 bg-amber-100 dark:bg-zinc-800 text-amber-900 dark:text-amber-300 rounded-lg text-[10px] sm:text-[11px] font-bold transition hover:bg-amber-200 cursor-pointer"
                  >
                    Home Chef (₹1,499)
                  </button>
                </div>
                {errors.serviceDetail && (
                  <p className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle text-[11px]"></i>
                    <span>{errors.serviceDetail}</span>
                  </p>
                )}
              </div>

              {/* Quantity / Count Selection */}
              {showQuantity ? (
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 sm:p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                      Quantity Required *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuantity(false)}
                      className="text-[11px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline cursor-pointer"
                    >
                      Hide quantity
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl p-1 border border-amber-200 dark:border-zinc-700 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                      >
                        <i className="fas fa-minus text-[10px] sm:text-xs"></i>
                      </button>
                      <span className="w-8 sm:w-10 text-center font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                      >
                        <i className="fas fa-plus text-[10px] sm:text-xs"></i>
                      </button>
                    </div>

                    {/* Quick Select Buttons 1-5 */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setQuantity(num)}
                          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                            quantity === num
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-amber-100 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {num} Qty
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuantity(true)}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fas fa-plus-circle"></i>
                    <span>Add item quantity / count (Optional)</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={e => {
                      setFormData({ ...formData, date: e.target.value });
                      if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                    }}
                    className={`w-full min-w-0 px-3.5 sm:px-4 py-2.5 rounded-xl border ${
                      errors.date
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20'
                        : 'border-gray-300 dark:border-zinc-700'
                    } bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                  />
                  {errors.date && (
                    <p className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle text-[11px]"></i>
                      <span>{errors.date}</span>
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Preferred Time
                    </label>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="w-full min-w-0 px-3.5 sm:px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, time: get24HourTimeString(new Date()) })}
                      className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold rounded-xl text-xs shrink-0 flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                      title="Set to current live time"
                    >
                      <i className="fas fa-history text-[11px]"></i>
                      <span>Now</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Additional Requirements / Dietary Preferences
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-w-0 px-3.5 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g. Vegetarian only, 15 guests, outdoor garden setup..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                <button
                  type="submit"
                  onClick={(e) => handleSubmit(e, false)}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-extrabold py-3 sm:py-3.5 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs sm:text-sm"
                >
                  <i className="fas fa-calendar-check text-sm"></i>
                  <span>Submit Booking Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(undefined, true)}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold py-3 sm:py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs sm:text-sm"
                >
                  <i className="fas fa-bolt text-amber-300 text-sm"></i>
                  <span>Pay via Razorpay</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

