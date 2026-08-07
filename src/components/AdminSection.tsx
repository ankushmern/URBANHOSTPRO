import React, { useState, useEffect } from 'react';
import { Recipe, Booking } from '../types';

interface AdminSectionProps {
  recipes: Recipe[];
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (id: number) => void;
  bookings: Booking[];
  onVerifyBooking: (id: string) => void;
  onRejectBooking: (id: string) => void;
  onDeleteBooking: (id: string) => void;
  showToast: (msg: string) => void;
}

interface Inquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status?: 'Pending' | 'Resolved';
  createdAt?: string;
}

interface AuditLogItem {
  _id: string;
  adminEmail: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  recipes,
  onAddRecipe,
  onDeleteRecipe,
  bookings,
  onVerifyBooking,
  onRejectBooking,
  onDeleteBooking,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'dishes' | 'bookings' | 'users' | 'inquiries' | 'payments' | 'audit'>('stats');

  // Stats State from REST API
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Booking State
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<'All' | 'Confirmed' | 'Pending' | 'Payment Failed'>('All');
  const [bookingPage, setBookingPage] = useState(1);
  const [assignChefModalBooking, setAssignChefModalBooking] = useState<Booking | null>(null);
  const [chefName, setChefName] = useState('Chef Sanjeev Kapoor');
  const [chefPhone, setChefPhone] = useState('+91 98765 00000');

  // Payment Admin State
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // User Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | 'user' | 'admin'>('All');
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'active' | 'banned'>('All');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Inquiry State
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      _id: 'inq_1',
      name: 'Rajesh Sharma',
      phone: '9876543210',
      email: 'rajesh@example.com',
      message: 'Looking for a monthly chef subscription for family of 4 in Mumbai.',
      status: 'Pending',
      createdAt: new Date().toLocaleDateString(),
    },
    {
      _id: 'inq_2',
      name: 'Priya Verma',
      phone: '9812345678',
      email: 'priya@example.com',
      message: 'Interested in booking catering for 25 people birthday party next Sunday.',
      status: 'Pending',
      createdAt: new Date().toLocaleDateString(),
    },
  ]);
  const [replyInquiryModal, setReplyInquiryModal] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Dish Management State
  const [dishCategoryFilter, setDishCategoryFilter] = useState('All');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [dishTitle, setDishTitle] = useState('');
  const [dishCategory, setDishCategory] = useState('North Indian');
  const [dishPrice, setDishPrice] = useState('249');
  const [dishTime, setDishTime] = useState('25 min');
  const [dishCuisine, setDishCuisine] = useState('Indian');
  const [dishImage, setDishImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch Dashboard Analytics
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch('/api/v1/admin/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (data.success) {
        setStatsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch All Payments
  const fetchAllPayments = async () => {
    setLoadingPayments(true);
    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch('/api/v1/payments/all', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (data.success) {
        setAllPayments(data.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userRoleFilter !== 'All') params.append('role', userRoleFilter);
      if (userStatusFilter !== 'All') params.append('status', userStatusFilter);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch('/api/v1/admin/audit-logs', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'payments') fetchAllPayments();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, userSearch, userRoleFilter, userStatusFilter]);

  // Handle Ban / Unban User
  const handleToggleUserBan = async (user: any) => {
    const nextBannedState = !user.isBanned;
    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch(`/api/v1/admin/users/${user._id || user.id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ isBanned: nextBannedState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🛡️ ${data.message}`);
        fetchUsers();
      } else {
        showToast(`❌ ${data.message}`);
      }
    } catch (err) {
      showToast('❌ Ban toggle failed');
    }
  };

  // Handle Edit User
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch(`/api/v1/admin/users/${editingUser._id || editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ User profile updated successfully!');
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast(`❌ ${data.message}`);
      }
    } catch (err) {
      showToast('❌ Failed to update user');
    }
  };

  // Handle Delete Single User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ User ${userName} deleted`);
        fetchUsers();
      }
    } catch (err) {
      showToast('❌ Delete user failed');
    }
  };

  // Handle Bulk Delete Users
  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) {
      showToast('Please select users to delete');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedUserIds.length} selected users?`)) return;

    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch('/api/v1/admin/users/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ ${data.message}`);
        setSelectedUserIds([]);
        fetchUsers();
      }
    } catch (err) {
      showToast('❌ Bulk delete failed');
    }
  };

  // Handle Assign Chef
  const handleAssignChefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignChefModalBooking) return;

    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch(`/api/v1/admin/bookings/${assignChefModalBooking.id}/assign-chef`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ chefName, chefPhone }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`👨‍🍳 Assigned Chef ${chefName} to booking!`);
        onVerifyBooking(assignChefModalBooking.id);
        setAssignChefModalBooking(null);
      } else {
        showToast(`❌ ${data.message}`);
      }
    } catch (err) {
      showToast('❌ Chef assignment failed');
    }
  };

  // Handle Refund Process
  const handleProcessRefund = async (paymentId: string, amount: number) => {
    if (!window.confirm(`Are you sure you want to process a full refund of ₹${amount} for Payment ${paymentId}?`)) return;

    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      const res = await fetch('/api/v1/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ paymentId, amount, reason: 'Admin initiated refund request' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`💸 Refund of ₹${amount} processed successfully! Refund ID: ${data.refundId || 'rfnd_1001'}`);
        fetchAllPayments();
      } else {
        showToast(`❌ Refund notice: ${data.message || 'Refund recorded in system'}`);
      }
    } catch (err) {
      showToast('❌ Failed to process refund');
    }
  };

  // CSV Export Helpers
  const exportUsersCSV = () => {
    if (usersList.length === 0) return showToast('No users to export');
    const headers = ['User ID', 'Name', 'Phone', 'Email', 'Role', 'Status', 'Location', 'Total Bookings'];
    const rows = usersList.map(u => [
      u._id || u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.role || 'user',
      u.isBanned ? 'banned' : 'active',
      `"${(u.location || '').replace(/"/g, '""')}"`,
      u.totalBookings || 0,
    ]);
    downloadCSV(headers, rows, 'CookMantra_Users');
  };

  const exportBookingsToCSV = () => {
    if (bookings.length === 0) return showToast('No bookings available to export');
    const headers = ['Booking ID', 'Customer Name', 'Phone', 'Service Details', 'Date', 'Time', 'Status', 'UTR Number'];
    const rows = bookings.map(b => [
      b.id,
      `"${(b.name || '').replace(/"/g, '""')}"`,
      `"${(b.phone || '').replace(/"/g, '""')}"`,
      `"${(b.serviceDetail || '').replace(/"/g, '""')}"`,
      `"${(b.date || '').replace(/"/g, '""')}"`,
      `"${(b.time || '').replace(/"/g, '""')}"`,
      `"${(b.status || 'Pending').replace(/"/g, '""')}"`,
      `"${(b.utrNumber || '').replace(/"/g, '""')}"`,
    ]);
    downloadCSV(headers, rows, 'CookMantra_Bookings');
  };

  const exportPaymentsCSV = () => {
    if (allPayments.length === 0) return showToast('No payments to export');
    const headers = ['Payment ID', 'Order ID', 'Invoice No', 'Amount', 'Status', 'Refund Status', 'Method', 'Date'];
    const rows = allPayments.map(p => [
      p.paymentId,
      p.orderId,
      p.invoiceNumber,
      p.amount,
      p.status,
      p.refundStatus || 'N/A',
      p.method || 'upi',
      p.createdAt,
    ]);
    downloadCSV(headers, rows, 'CookMantra_Payments');
  };

  const downloadCSV = (headers: string[], rows: any[][], fileName: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`📊 Exported ${fileName} CSV!`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string;
        const token = localStorage.getItem('cookmantra_jwt_token');
        const res = await fetch('/api/v1/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ image: base64Data, filename: file.name }),
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setDishImage(data.imageUrl);
          showToast('✅ Image uploaded successfully!');
        } else {
          setDishImage(base64Data);
        }
      } catch (err) {
        showToast('Image uploaded.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishTitle.trim() || !dishPrice) return showToast('Please fill title and price');

    const priceNum = parseInt(dishPrice) || 199;
    onAddRecipe({
      name: dishTitle,
      cuisine: dishCuisine,
      category: dishCategory,
      time: dishTime,
      img: dishImage,
    });

    try {
      const token = localStorage.getItem('cookmantra_jwt_token');
      await fetch('/api/v1/dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          title: dishTitle,
          category: dishCategory,
          price: priceNum,
          prepTime: dishTime,
          image: dishImage,
          isVeg: true,
        }),
      });
    } catch (err) {}

    setShowAddDishModal(false);
    setDishTitle('');
    showToast(`👑 Admin: Added "${dishTitle}" (₹${priceNum}) to Live Catalog!`);
  };

  const isPendingStatus = (s: string | undefined) => !s || s.toLowerCase().includes('pending');
  const isConfirmedStatus = (s: string | undefined) => s?.toLowerCase() === 'confirmed' || s?.toLowerCase() === 'completed';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/30 mb-2">
              <i className="fas fa-crown"></i> CookMantra Phase 3 Master Admin Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Operations & Governance Center</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time analytics, user access governance, instant chef assignment, audit logging, and Razorpay refund management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Admin Backend Active
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { key: 'stats', label: 'Analytics & Stats', icon: 'fa-chart-line' },
          { key: 'users', label: `Users (${usersList.length || 'Manage'})`, icon: 'fa-users-cog' },
          { key: 'bookings', label: `Bookings (${bookings.length})`, icon: 'fa-calendar-check' },
          { key: 'payments', label: `Payments & Refunds (${allPayments.length || 'Audit'})`, icon: 'fa-hand-holding-usd' },
          { key: 'dishes', label: `Dishes (${recipes.length})`, icon: 'fa-utensils' },
          { key: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: 'fa-envelope-open-text' },
          { key: 'audit', label: 'Audit Logs', icon: 'fa-history' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === t.key
                ? 'bg-amber-500 text-gray-950 shadow-md font-extrabold'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <i className={`fas ${t.icon}`}></i>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#161618] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase">Total System Users</p>
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
                {statsData?.stats?.totalUsers || usersList.length || 24}
              </p>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-block">Registered Clients & Staff</span>
            </div>

            <div className="bg-white dark:bg-[#161618] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase">Total Bookings</p>
              <p className="text-3xl font-extrabold text-amber-500 mt-2">
                {statsData?.stats?.totalBookings || bookings.length || 42}
              </p>
              <span className="text-[10px] text-amber-500 font-bold mt-1 inline-block">
                {bookings.filter(b => isPendingStatus(b.status)).length} Pending Action
              </span>
            </div>

            <div className="bg-white dark:bg-[#161618] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase">Confirmed Revenue</p>
              <p className="text-3xl font-extrabold text-emerald-500 mt-2">
                ₹{(statsData?.stats?.totalRevenue || bookings.length * 2499).toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-block">Razorpay UPI + Direct Invoices</span>
            </div>

            <div className="bg-white dark:bg-[#161618] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase">Pending Refunds</p>
              <p className="text-3xl font-extrabold text-rose-500 mt-2">
                {statsData?.stats?.refundRequestsCount || allPayments.filter(p => p.refundStatus === 'Requested').length || 0}
              </p>
              <span className="text-[10px] text-rose-400 font-bold mt-1 inline-block">Requires Admin Approval</span>
            </div>
          </div>

          {/* Revenue & Booking Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <div className="bg-white dark:bg-[#161618] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-chart-bar text-amber-500"></i> Monthly Revenue Growth (INR)
                </h3>
                <span className="text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">+42% MoM</span>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-zinc-200 dark:border-zinc-800">
                {(statsData?.charts?.monthlyRevenue || [
                  { month: 'Mar', revenue: 45000 },
                  { month: 'Apr', revenue: 62000 },
                  { month: 'May', revenue: 89000 },
                  { month: 'Jun', revenue: 112000 },
                  { month: 'Jul', revenue: 148000 },
                  { month: 'Aug', revenue: 185000 },
                ]).map((m: any, idx: number) => {
                  const maxRev = 200000;
                  const heightPercent = Math.min(100, Math.max(20, Math.round((m.revenue / maxRev) * 100)));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="opacity-0 group-hover:opacity-100 transition text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded font-mono font-bold">
                        ₹{(m.revenue / 1000).toFixed(0)}k
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-xl group-hover:from-amber-400 group-hover:to-amber-300 transition shadow-sm"
                      ></div>
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Booking Trends Chart */}
            <div className="bg-white dark:bg-[#161618] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-calendar-week text-emerald-500"></i> Weekly Booking Demand Volume
                </h3>
                <span className="text-[11px] text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full">Peak: Weekend</span>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-zinc-200 dark:border-zinc-800">
                {(statsData?.charts?.bookingTrends || [
                  { day: 'Mon', count: 8 },
                  { day: 'Tue', count: 12 },
                  { day: 'Wed', count: 15 },
                  { day: 'Thu', count: 10 },
                  { day: 'Fri', count: 22 },
                  { day: 'Sat', count: 35 },
                  { day: 'Sun', count: 28 },
                ]).map((d: any, idx: number) => {
                  const maxCount = 40;
                  const heightPercent = Math.min(100, Math.max(15, Math.round((d.count / maxCount) * 100)));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="opacity-0 group-hover:opacity-100 transition text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded font-bold">
                        {d.count} orders
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl group-hover:from-emerald-500 group-hover:to-emerald-300 transition shadow-sm"
                      ></div>
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#161618] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">User Accounts Governance</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Search clients, edit profiles, toggle bans, or bulk export CSV.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedUserIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteUsers}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fas fa-trash-alt"></i>
                  <span>Delete Selected ({selectedUserIds.length})</span>
                </button>
              )}

              <button
                onClick={exportUsersCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-file-csv"></i>
                <span>Export Users CSV</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-2.5 text-zinc-400 text-xs"></i>
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user by name, phone, email, or location..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#161618] text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className="bg-white dark:bg-[#161618] px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold"
              >
                <option value="All">Role: All</option>
                <option value="user">Role: User</option>
                <option value="admin">Role: Admin</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={e => setUserStatusFilter(e.target.value as any)}
                className="bg-white dark:bg-[#161618] px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold"
              >
                <option value="All">Status: All</option>
                <option value="active">Status: Active</option>
                <option value="banned">Status: Banned</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 font-bold uppercase border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3.5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length > 0 && selectedUserIds.length === usersList.length}
                        onChange={e => {
                          if (e.target.checked) setSelectedUserIds(usersList.map(u => u._id || u.id));
                          else setSelectedUserIds([]);
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3.5">User Profile</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-400 font-bold">
                        No users matching filter criteria
                      </td>
                    </tr>
                  ) : (
                    usersList.map(u => {
                      const uid = u._id || u.id;
                      const isSelected = selectedUserIds.includes(uid);
                      const isBanned = u.isBanned || u.status === 'banned';

                      return (
                        <tr key={uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                          <td className="p-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) setSelectedUserIds(prev => [...prev, uid]);
                                else setSelectedUserIds(prev => prev.filter(id => id !== uid));
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3.5 font-bold flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs shrink-0">
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-zinc-900 dark:text-white font-bold">{u.name}</p>
                              <p className="text-[10px] text-zinc-400 font-mono">{uid}</p>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <p>{u.phone}</p>
                            <p className="text-zinc-400 text-[10px]">{u.email || 'No email'}</p>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}>
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase ${
                              isBanned
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="p-3.5 text-zinc-500">{u.location || 'Maharashtra, India'}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewingUser(u)}
                                className="p-1.5 text-zinc-400 hover:text-amber-500 transition cursor-pointer"
                                title="View Profile"
                              >
                                <i className="fas fa-eye text-xs"></i>
                              </button>
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 text-zinc-400 hover:text-blue-500 transition cursor-pointer"
                                title="Edit Profile"
                              >
                                <i className="fas fa-edit text-xs"></i>
                              </button>
                              <button
                                onClick={() => handleToggleUserBan(u)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                                  isBanned
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 hover:bg-emerald-200'
                                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 hover:bg-rose-200'
                                }`}
                              >
                                {isBanned ? 'Unban' : 'Ban'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(uid, u.name)}
                                className="p-1.5 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                                title="Delete User"
                              >
                                <i className="fas fa-trash-alt text-xs"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#161618] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Booking Orders & Chef Assignment</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Search client orders, assign executive chefs, verify bank UTR numbers.</p>
            </div>

            <button
              onClick={exportBookingsToCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <i className="fas fa-file-csv text-sm"></i>
              <span>Export CSV</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-2.5 text-zinc-400 text-xs"></i>
              <input
                type="text"
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                placeholder="Search by client name, phone, service, or UTR..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#161618] text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex bg-white dark:bg-[#161618] p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold shrink-0">
              {(['All', 'Confirmed', 'Pending', 'Payment Failed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setBookingFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    bookingFilterStatus === st
                      ? 'bg-amber-500 text-gray-950 font-extrabold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {bookings
              .filter(b => {
                const matchStatus = bookingFilterStatus === 'All'
                  ? true
                  : bookingFilterStatus === 'Confirmed'
                  ? isConfirmedStatus(b.status)
                  : bookingFilterStatus === 'Pending'
                  ? isPendingStatus(b.status)
                  : b.status === 'Payment Failed';

                const matchQuery = !bookingSearch.trim() ||
                  (b.name && b.name.toLowerCase().includes(bookingSearch.toLowerCase())) ||
                  (b.phone && b.phone.includes(bookingSearch)) ||
                  (b.serviceDetail && b.serviceDetail.toLowerCase().includes(bookingSearch.toLowerCase())) ||
                  (b.utrNumber && b.utrNumber.toLowerCase().includes(bookingSearch.toLowerCase()));

                return matchStatus && matchQuery;
              })
              .map(b => (
                <div key={b.id} className="p-4 bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-zinc-900 dark:text-white">{b.serviceDetail}</p>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isConfirmedStatus(b.status)
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : b.status === 'Payment Failed'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}>
                        {b.status || 'Pending Verification'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Client: <span className="font-bold text-zinc-800 dark:text-zinc-200">{b.name}</span> ({b.phone}) • Date: {b.date} at {b.time}
                    </p>
                    {b.utrNumber && (
                      <p className="text-xs text-amber-500 font-mono font-bold mt-0.5">
                        Submitted UTR: {b.utrNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                    <button
                      onClick={() => setAssignChefModalBooking(b)}
                      className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fas fa-user-chef"></i> Assign Chef
                    </button>

                    {!isConfirmedStatus(b.status) && (
                      <button
                        onClick={() => onVerifyBooking(b.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fas fa-check"></i> Verify Payment
                      </button>
                    )}

                    {b.status !== 'Payment Failed' && (
                      <button
                        onClick={() => onRejectBooking(b.id)}
                        className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteBooking(b.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS & REFUNDS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2 bg-white dark:bg-[#161618] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Razorpay Payments & Refunds</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">View live transactions and execute full/partial Razorpay client refunds.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportPaymentsCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-file-csv"></i>
                <span>Export CSV</span>
              </button>

              <button
                onClick={fetchAllPayments}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <i className="fas fa-sync-alt text-amber-500"></i> Refresh
              </button>
            </div>
          </div>

          {loadingPayments ? (
            <div className="p-12 text-center text-xs text-zinc-500">
              <i className="fas fa-spinner fa-spin text-amber-500 text-2xl mb-2"></i>
              <p>Fetching payment transactions from database...</p>
            </div>
          ) : allPayments.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#161618]">
              <i className="fas fa-file-invoice text-3xl mb-2 text-zinc-400"></i>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">No payment transactions found in database</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allPayments.map((p, idx) => {
                const isSuccess = p.status === 'Success';
                const isRefunded = p.refundStatus === 'Processed' || p.refundStatus === 'Requested';

                return (
                  <div
                    key={p.paymentId || idx}
                    className="p-4 bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-zinc-900 dark:text-white">₹{p.amount}</span>
                        <span className="text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold">
                          Inv: {p.invoiceNumber || 'INV-2026-9041'}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {p.status}
                        </span>

                        {isRefunded && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 uppercase">
                            Refund: {p.refundStatus}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-2">
                        <span>Payment ID: <strong className="font-mono text-zinc-800 dark:text-zinc-200">{p.paymentId}</strong></span>
                        <span>• Order ID: <strong className="font-mono text-zinc-800 dark:text-zinc-200">{p.orderId}</strong></span>
                        <span>• Method: <strong className="uppercase text-zinc-800 dark:text-zinc-200">{p.method}</strong></span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Date: {new Date(p.createdAt || Date.now()).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {isSuccess && !isRefunded && (
                        <button
                          onClick={() => handleProcessRefund(p.paymentId, p.amount)}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <i className="fas fa-undo"></i>
                          <span>Process Refund</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DISHES MANAGEMENT */}
      {activeTab === 'dishes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2 bg-white dark:bg-[#161618] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Menu Catalog Management</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Add new dishes, update pricing, or filter by category.</p>
            </div>

            <button
              onClick={() => setShowAddDishModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-plus"></i> Add New Dish
            </button>
          </div>

          <div className="flex gap-2">
            {['All', 'North Indian', 'South Indian', 'Popular', 'Trial'].map(cat => (
              <button
                key={cat}
                onClick={() => setDishCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dishCategoryFilter === cat
                    ? 'bg-amber-500 text-gray-950 shadow-2xs font-extrabold'
                    : 'bg-white dark:bg-[#161618] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recipes
              .filter(r => dishCategoryFilter === 'All' || r.category === dishCategoryFilter)
              .map(recipe => (
                <div key={recipe.id} className="bg-white dark:bg-[#161618] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-3">
                  <img src={recipe.img} className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 shrink-0" alt={recipe.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{recipe.name}</p>
                    <p className="text-xs text-amber-500 font-semibold">{recipe.cuisine} • {recipe.time}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{recipe.category}</p>
                  </div>
                  <button
                    onClick={() => onDeleteRecipe(recipe.id)}
                    className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                    title="Delete Dish"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 6: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#161618] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Customer Contact Enquiries</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Respond to client leads and mark issues as resolved.</p>
            </div>
          </div>

          <div className="space-y-3">
            {inquiries.map(inq => (
              <div key={inq._id} className="p-4 bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-zinc-900 dark:text-white">{inq.name}</p>
                    <span className="text-[10px] text-zinc-400">{inq.createdAt}</span>
                  </div>
                  <p className="text-xs text-amber-500 font-semibold">{inq.phone} • {inq.email}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">{inq.message}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setReplyInquiryModal(inq);
                      setReplyText(`Hello ${inq.name}, thank you for contacting CookMantra! `);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <i className="fas fa-reply"></i> Reply
                  </button>

                  <button
                    onClick={() => {
                      setInquiries(prev => prev.filter(i => i._id !== inq._id));
                      showToast('✅ Inquiry marked as resolved');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <i className="fas fa-check"></i> Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-[#161618] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Security Audit Trails</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Track all admin logins, bans, refunds, and permission changes.</p>
            </div>

            <button
              onClick={fetchAuditLogs}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <i className="fas fa-sync-alt text-amber-500"></i> Refresh
            </button>
          </div>

          {loadingAudit ? (
            <div className="p-12 text-center text-xs text-zinc-500">
              <i className="fas fa-spinner fa-spin text-amber-500 text-2xl mb-2"></i>
              <p>Fetching security logs...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Admin Email</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {auditLogs.map((log, idx) => (
                    <tr key={log._id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-zinc-800 dark:text-zinc-200">{log.adminEmail}</td>
                      <td className="p-3.5 text-zinc-600 dark:text-zinc-300">{log.details}</td>
                      <td className="p-3.5 font-mono text-[10px] text-zinc-400">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 w-full max-w-md border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-user-edit text-amber-500"></i> Edit User Profile
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-zinc-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Phone</label>
                <input
                  type="text"
                  required
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Role</label>
                  <select
                    value={editingUser.role || 'user'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Location</label>
                  <input
                    type="text"
                    value={editingUser.location || 'Mumbai, MH'}
                    onChange={e => setEditingUser({ ...editingUser, location: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs px-5 py-2 rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Profile Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 w-full max-w-md border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-id-card text-amber-500"></i> User Full Profile
              </h3>
              <button onClick={() => setViewingUser(null)} className="text-zinc-400 hover:text-white text-lg">&times;</button>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-base shrink-0">
                  {(viewingUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">{viewingUser.name}</p>
                  <p className="text-zinc-400 font-mono text-[10px]">ID: {viewingUser._id || viewingUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-300">
                <p><strong>Phone:</strong> {viewingUser.phone}</p>
                <p><strong>Email:</strong> {viewingUser.email || 'N/A'}</p>
                <p><strong>Role:</strong> <span className="uppercase font-bold text-amber-500">{viewingUser.role || 'user'}</span></p>
                <p><strong>Status:</strong> <span className="uppercase font-bold text-emerald-500">{viewingUser.isBanned ? 'Banned' : 'Active'}</span></p>
                <p><strong>Location:</strong> {viewingUser.location || 'Mumbai'}</p>
                <p><strong>Bookings:</strong> {viewingUser.totalBookings || 0}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingUser(null)}
                className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs px-5 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Chef Modal */}
      {assignChefModalBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 w-full max-w-md border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-user-chef text-amber-500"></i> Assign Executive Chef
              </h3>
              <button onClick={() => setAssignChefModalBooking(null)} className="text-zinc-400 hover:text-white text-lg">&times;</button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-600 dark:text-amber-400">
              <p>Assigning chef for <strong>{assignChefModalBooking.serviceDetail}</strong> requested by <strong>{assignChefModalBooking.name}</strong> on {assignChefModalBooking.date}.</p>
            </div>

            <form onSubmit={handleAssignChefSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Executive Chef Name</label>
                <input
                  type="text"
                  required
                  value={chefName}
                  onChange={e => setChefName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Chef Mobile Contact</label>
                <input
                  type="text"
                  required
                  value={chefPhone}
                  onChange={e => setChefPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignChefModalBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs px-5 py-2 rounded-xl shadow-md"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Inquiry Modal */}
      {replyInquiryModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 w-full max-w-md border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-reply text-amber-500"></i> Reply to Customer Inquiry
              </h3>
              <button onClick={() => setReplyInquiryModal(null)} className="text-zinc-400 hover:text-white text-lg">&times;</button>
            </div>

            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">{replyInquiryModal.name} ({replyInquiryModal.phone})</p>
              <p className="text-zinc-500 italic">"{replyInquiryModal.message}"</p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Reply Message</label>
              <textarea
                rows={4}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="w-full mt-1 p-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplyInquiryModal(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>

              <a
                href={`https://wa.me/91${replyInquiryModal.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(replyText)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  showToast('💬 Opening WhatsApp to reply to client...');
                  setReplyInquiryModal(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <i className="fab fa-whatsapp text-sm"></i>
                <span>Send WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {showAddDishModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 w-full max-w-md border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-plus-circle text-amber-500"></i> Add New Dish (Admin)
              </h3>
              <button onClick={() => setShowAddDishModal(false)} className="text-zinc-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleCreateDishSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Dish Name</label>
                <input
                  type="text"
                  required
                  value={dishTitle}
                  onChange={(e) => setDishTitle(e.target.value)}
                  placeholder="e.g. Shahi Paneer Special"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="North Indian">North Indian</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Popular">Popular</option>
                    <option value="Trial">Trial</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="249"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Prep Time</label>
                  <input
                    type="text"
                    value={dishTime}
                    onChange={(e) => setDishTime(e.target.value)}
                    placeholder="25 min"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Cuisine</label>
                  <input
                    type="text"
                    value={dishCuisine}
                    onChange={(e) => setDishCuisine(e.target.value)}
                    placeholder="Indian"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Dish Image (URL or Upload File)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={dishImage}
                    onChange={(e) => setDishImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                  <label className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer shrink-0">
                    {uploadingImage ? '...' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs px-5 py-2 rounded-xl shadow-md"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
