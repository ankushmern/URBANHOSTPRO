import React, { useState, useEffect } from 'react';
import { Booking, UserAddress } from '../types';
import { downloadInvoicePDF, InvoiceData } from '../utils/invoiceGenerator';
import { AddressManager } from './AddressManager';
import { ReviewsSection } from './ReviewsSection';

interface DashboardSectionProps {
  onOpenBooking: () => void;
  setActiveSection: (sec: string) => void;
  bookings: Booking[];
  savedCount: number;
  dishesCount: number;
  userRole?: 'user' | 'admin';
  onDeleteBooking: (id: string) => void;
  onPayBooking?: (booking: Booking) => void;
  onVerifyBooking?: (id: string) => void;
  onRejectBooking?: (id: string) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  onOpenBooking,
  setActiveSection,
  bookings,
  savedCount,
  dishesCount,
  userRole = 'user',
  onDeleteBooking,
  onPayBooking,
  onVerifyBooking,
  onRejectBooking,
}) => {
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Pending'>('All');
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'addresses' | 'reviews'>('bookings');
  const [payments, setPayments] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const res = await fetch('/api/v1/user/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      }
    } catch (e) {
      /* ignore */
    }
  };
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Success' | 'Failed' | 'Pending'>('All');
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch('/api/v1/payments/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.payments)) {
        setPayments(data.payments);
      }
    } catch (e) {
      console.warn('Could not load payment history', e);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isPendingStatus = (statusStr: string | undefined): boolean => {
    if (!statusStr) return true;
    const s = statusStr.toLowerCase();
    return s.includes('pending') || s.includes('awaiting') || s.includes('verification');
  };

  const isConfirmedStatus = (statusStr: string | undefined): boolean => {
    if (!statusStr) return false;
    const s = statusStr.toLowerCase();
    return s === 'confirmed' || s === 'completed';
  };

  const isFailedStatus = (statusStr: string | undefined): boolean => {
    if (!statusStr) return false;
    const s = statusStr.toLowerCase();
    return s.includes('failed') || s.includes('rejected');
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Confirmed') return isConfirmedStatus(b.status);
    if (filter === 'Pending') return isPendingStatus(b.status);
    return b.status === filter;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Orders & Booking Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Welcome back, Chef! Here’s your live culinary overview & real-time booking management.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm bg-white dark:bg-[#161618] px-4 py-2 rounded-full shadow-sm border border-zinc-200 dark:border-[#2D2D30]">
          <i className="far fa-calendar-alt text-amber-500"></i>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">{currentDate}</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161618] rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30] hover:border-amber-500/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Total Bookings</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{bookings.length}</p>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1">
                <i className="fas fa-signal mr-1"></i> Live Realtime Sync
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-500">
              <i className="fas fa-calendar-check text-lg"></i>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveSection('coursesSection')}
          className="bg-white dark:bg-[#161618] rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30] cursor-pointer hover:border-amber-500 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Available Dishes</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{dishesCount}</p>
              <p className="text-[11px] text-amber-500 font-semibold mt-1">Explore Dishes →</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
              <i className="fas fa-utensils text-lg"></i>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveSection('savedRecipesSection')}
          className="bg-white dark:bg-[#161618] rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30] cursor-pointer hover:border-amber-500 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Saved Wishlist</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{savedCount}</p>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1">View Collection →</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500">
              <i className="fas fa-bookmark text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161618] rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30] hover:border-amber-500/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Active Status</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">Live</p>
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                <i className="fas fa-circle text-[8px] animate-pulse mr-1"></i> Online & Ready
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-500">
              <i className="fas fa-glass-cheers text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector Header */}
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-4 sm:gap-6 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <i className="fas fa-calendar-check text-amber-500"></i>
          <span>Active Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('payments');
            fetchPayments();
          }}
          className={`pb-3 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <i className="fas fa-credit-card text-emerald-500"></i>
          <span>Payment Transactions ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <i className="fas fa-map-marked-alt text-blue-500"></i>
          <span>Delivery Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <i className="fas fa-star text-amber-400"></i>
          <span>Ratings & Reviews</span>
        </button>
      </div>

      {/* Main Content Box based on Active Tab */}
      {activeTab === 'bookings' ? (
        <div className="bg-white dark:bg-[#161618] rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30]">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <i className="fas fa-history text-yellow-500"></i> My Bookings List
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                {(['All', 'Confirmed', 'Pending'] as const).map(tab => {
                  const count = tab === 'All'
                    ? bookings.length
                    : tab === 'Confirmed'
                    ? bookings.filter(b => isConfirmedStatus(b.status)).length
                    : bookings.filter(b => isPendingStatus(b.status)).length;

                  return (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        filter === tab
                          ? 'bg-amber-500 text-white shadow-2xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{tab}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          filter === tab
                            ? 'bg-white/20 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <i className="fas fa-calendar-times text-2xl mb-2 text-zinc-400"></i>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No bookings match this filter</p>
                <button
                  onClick={onOpenBooking}
                  className="mt-3 text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                >
                  + Create a new booking
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredBookings.map(b => {
                  const bStatus = b.status || 'Pending Bank Verification';
                  const isPendingVerification = isPendingStatus(bStatus) && !isFailedStatus(bStatus);
                  const isConfirmed = isConfirmedStatus(bStatus);
                  const isFailed = isFailedStatus(bStatus);

                  return (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition border border-zinc-100 dark:border-zinc-800 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={b.avatarImg || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=100&auto=format&fit=crop'}
                          className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
                          alt={b.name}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{b.serviceDetail}</p>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : isPendingVerification
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 animate-pulse border border-amber-300'
                                  : isFailed
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              }`}
                            >
                              <i className={`fas ${isConfirmed ? 'fa-check-circle' : isPendingVerification ? 'fa-clock' : 'fa-info-circle'}`}></i>
                              {isConfirmed
                                ? 'Confirmed (Payment Verified)'
                                : isPendingVerification
                                ? 'Pending Bank Verification'
                                : bStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            For <span className="font-semibold text-zinc-800 dark:text-zinc-200">{b.name}</span> • <i className="far fa-calendar-alt text-amber-500 ml-1"></i> {b.date} at {b.time}
                            {b.utrNumber && (
                              <span className="ml-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono px-1.5 py-0.5 rounded text-[10px] font-bold">
                                UTR: {b.utrNumber}
                              </span>
                            )}
                          </p>

                          {isPendingVerification && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                              <i className="fas fa-university"></i> Awaiting bank confirmation on account <span className="font-mono underline">aankushrajput672@okhdfcbank</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                        {userRole === 'admin' && isPendingVerification && onVerifyBooking && (
                          <button
                            onClick={() => onVerifyBooking(b.id)}
                            className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                            title="Click when ₹ money reflects in your bank account"
                          >
                            <i className="fas fa-check"></i>
                            <span>Verify in Bank</span>
                          </button>
                        )}

                        {userRole === 'admin' && isPendingVerification && onRejectBooking && (
                          <button
                            onClick={() => onRejectBooking(b.id)}
                            className="text-[11px] bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            title="Payment not received"
                          >
                            <i className="fas fa-times"></i>
                            <span>Reject</span>
                          </button>
                        )}

                        {bStatus === 'Payment Pending' && onPayBooking && (
                          <button
                            onClick={() => onPayBooking(b)}
                            className="text-[11px] bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                            title="Complete UPI Payment & Enter UTR"
                          >
                            <i className="fas fa-qrcode text-xs"></i>
                            <span>Pay Now & Enter UTR</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedReceipt(b)}
                          className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                          title="View Official Receipt"
                        >
                          <i className="fas fa-receipt text-xs"></i>
                          <span>Receipt</span>
                        </button>

                        <button
                          onClick={() => onDeleteBooking(b.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                          title="Cancel & Delete Booking"
                          aria-label="Delete booking"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      ) : activeTab === 'payments' ? (
        /* Payment History View */
        <div className="bg-white dark:bg-[#161618] rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30] space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <i className="fas fa-file-invoice-dollar text-emerald-500"></i> All Transactions & Invoices
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                {(['All', 'Success', 'Pending', 'Failed'] as const).map(pTab => (
                  <button
                    key={pTab}
                    onClick={() => setPaymentFilter(pTab)}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                      paymentFilter === pTab
                        ? 'bg-amber-500 text-gray-950 font-bold shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {pTab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoadingPayments ? (
            <div className="p-8 text-center text-xs text-gray-500">
              <i className="fas fa-spinner fa-spin text-amber-500 text-lg mb-2"></i>
              <p>Loading payment history...</p>
            </div>
          ) : payments.filter(p => paymentFilter === 'All' || p.status === paymentFilter).length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <i className="fas fa-receipt text-2xl mb-2 text-zinc-400"></i>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No payment records found for {paymentFilter}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {payments
                .filter(p => paymentFilter === 'All' || p.status === paymentFilter)
                .map((p, idx) => {
                  const isSuccess = p.status === 'Success';
                  const isPending = p.status === 'Pending';

                  return (
                    <div
                      key={p.paymentId || idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                            ₹{p.amount?.toLocaleString('en-IN') || 2499}
                          </span>
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-bold">
                            Invoice: {p.invoiceNumber || 'INV-2026-9041'}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              isSuccess
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                          <span>Payment ID: <strong className="font-mono text-gray-700 dark:text-gray-300">{p.paymentId}</strong></span>
                          <span>• Order ID: <strong className="font-mono text-gray-700 dark:text-gray-300">{p.orderId}</strong></span>
                          <span>• Method: <strong className="uppercase text-gray-700 dark:text-gray-300">{p.method}</strong></span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Date: {new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isSuccess && (
                          <button
                            onClick={() => {
                              const invData: InvoiceData = {
                                invoiceNumber: p.invoiceNumber || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                                date: p.createdAt || new Date().toISOString(),
                                paymentId: p.paymentId,
                                orderId: p.orderId,
                                bookingId: p.bookingId || 'BK-2026-901',
                                customerName: p.customerName || 'CookMantra Client',
                                customerPhone: p.customerPhone || '9876543210',
                                customerEmail: p.customerEmail || '',
                                serviceType: 'culinary',
                                serviceDetail: 'Executive Culinary Chef Service',
                                quantity: 1,
                                serviceDate: 'Scheduled Service',
                                serviceTime: '12:00 PM',
                                subtotal: Math.round((p.amount / 1.18) * 100) / 100,
                                gstAmount: Math.round((p.amount - p.amount / 1.18) * 100) / 100,
                                totalAmount: p.amount,
                                paymentMethod: p.method,
                                status: p.status,
                              };
                              downloadInvoicePDF(invData);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <i className="fas fa-file-pdf"></i>
                            <span>Download Tax Invoice PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : activeTab === 'addresses' ? (
        <AddressManager addresses={addresses} onUpdateAddresses={(updated) => setAddresses(updated)} />
      ) : activeTab === 'reviews' ? (
        <ReviewsSection />
      ) : null}

      {/* Analytics & Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#161618] rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30]">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <i className="fas fa-user-plus text-amber-500"></i> Recommended Chefs for You
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex-1">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=150&auto=format&fit=crop"
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                alt="Chef Prem"
              />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Prem</p>
                <p className="text-[10px] text-gray-500">Multi‑cuisine • 4.9 ⭐</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex-1">
              <img
                src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?q=80&w=150&auto=format&fit=crop"
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                alt="Mahesh"
              />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Mahesh</p>
                <p className="text-[10px] text-gray-500">Bartender • 4.8 ⭐</p>
              </div>
            </div>
          </div>
          <button
            onClick={onOpenBooking}
            className="mt-4 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-semibold px-4 py-2 rounded-xl w-full transition cursor-pointer"
          >
            Browse all professionals →
          </button>
        </div>

        <div className="bg-white dark:bg-[#161618] rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-[#2D2D30]">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-amber-500"></i> Popular Cuisines This Month
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Italian</span>
                <span className="text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-gray-700 dark:text-gray-300">North Indian</span>
                <span className="text-gray-900 dark:text-white">32%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Chinese</span>
                <span className="text-gray-900 dark:text-white">28%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Booking Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-md w-full border border-gray-200 dark:border-zinc-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs transition cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center space-y-2 mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner ${
                selectedReceipt.status === 'Confirmed'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}>
                <i className={`fas ${selectedReceipt.status === 'Confirmed' ? 'fa-check-circle' : 'fa-hourglass-half'}`}></i>
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">CookMantra Booking Receipt</h3>
              <p className={`text-xs font-bold flex items-center justify-center gap-1 ${
                selectedReceipt.status === 'Confirmed'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                <i className="fas fa-shield-alt"></i>
                {selectedReceipt.status === 'Confirmed'
                  ? 'Payment Verified & Booking Confirmed'
                  : 'Awaiting Receiver Bank Verification'}
              </p>
            </div>

            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900/80 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-gray-500 font-medium">Booking Reference:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedReceipt.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-gray-500 font-medium">Customer Name:</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedReceipt.name}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-gray-500 font-medium">Phone / Contact:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.phone}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-gray-500 font-medium">Service Detail:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedReceipt.serviceDetail}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-gray-500 font-medium">Date & Time:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.date} at {selectedReceipt.time}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-gray-500 font-medium">Direct Receiver:</span>
                <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300 bg-amber-500/10 px-2 py-0.5 rounded">aankushrajput672@okhdfcbank</span>
              </div>
              {selectedReceipt.utrNumber && (
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-gray-500 font-medium">UPI UTR / Ref No:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{selectedReceipt.utrNumber}</span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className={`font-extrabold uppercase tracking-wide ${
                  selectedReceipt.status === 'Confirmed'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400 font-bold animate-pulse'
                }`}>
                  {selectedReceipt.status === 'Confirmed'
                    ? '✅ Confirmed & Verified in Bank'
                    : '⏳ Pending Bank Verification'}
                </span>
              </div>
            </div>

            {(selectedReceipt.status === 'Payment Verification Pending' || selectedReceipt.status === 'Pending') && onVerifyBooking && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-center space-y-2">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-semibold">
                  Payment is awaiting bank credit verification at <span className="font-mono font-bold">aankushrajput672@okhdfcbank</span>.
                </p>
                <button
                  onClick={() => {
                    onVerifyBooking(selectedReceipt.id);
                    setSelectedReceipt(prev => prev ? { ...prev, status: 'Confirmed' } : null);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="fas fa-university"></i>
                  <span>Verify Money Received in Bank & Confirm</span>
                </button>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-print"></i> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
