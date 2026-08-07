import React from 'react';
import { CookMantraLogo } from '../CookMantraLogo';

interface LegalPageProps {
  onBackToHome: () => void;
}

export const CancellationPolicy: React.FC<LegalPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121214] text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3">
            <CookMantraLogo size="sm" showText={true} />
            <span className="hidden sm:inline-block text-gray-300 dark:text-zinc-700">|</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
              Refund Guidelines
            </span>
          </div>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition cursor-pointer active:scale-95"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-gray-950 rounded-3xl p-6 sm:p-10 shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-black/10 text-gray-950 text-xs font-extrabold px-3 py-1 rounded-full backdrop-blur-sm border border-black/10">
              <i className="fas fa-undo-alt text-xs"></i>
              <span>CookMantra Hassle-Free Guarantee</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950">
              Cancellation & Refund Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-900/90 font-medium leading-relaxed">
              Transparent, fair, and fast guidelines for cancelling orders or claiming refunds for Food Delivery, Chef Bookings, Meal Prep, Masterclasses, and Catering.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-gray-950/80">
              <i className="far fa-calendar-alt"></i>
              <span>Last Updated: July 31, 2026</span>
            </div>
          </div>
        </div>

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-box-open"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              1. Food Orders & Daily Dishes
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Food orders can be cancelled with a <strong>100% full refund</strong> within 15 minutes of order placement, prior to kitchen preparation. Once cooking or dispatch has initiated, cancellations may incur a nominal preparation fee.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-user-chef"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              2. Home Chef Services & Event Catering
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              For scheduled private chef visits and event catering:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
              <li><strong>24+ Hours Notice:</strong> 100% Full Refund or free date rescheduling.</li>
              <li><strong>6 to 24 Hours Notice:</strong> 80% Refund (20% retained for chef reservation).</li>
              <li><strong>Less than 6 Hours:</strong> 50% Refund due to fresh ingredient acquisition.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              3. Weekly Meal Prep Subscriptions
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Subscriptions can be paused or cancelled at any time from your Orders dashboard. Pro-rata refunds for remaining unused days are processed immediately with 24 hours advance notice before the next scheduled meal delivery.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              4. Masterclass Enrollments
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Masterclass bookings qualify for a 100% refund up to 12 hours before the scheduled live class. Alternatively, you can transfer your seat to any future masterclass session at zero additional charge.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              5. Refund Processing Timelines
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Approved refunds are credited back to your original source account (UPI, Bank Account, or Credit Card) within <strong>3 to 5 business days</strong>. Wallet credits are applied instantly upon confirmation.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-medal"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              6. Quality Guarantee & Complaints
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Your satisfaction is paramount. If you experience food quality discrepancies, chef unpunctuality, or missing items, contact us within 2 hours of service delivery for instant resolution or re-cooking voucher issuance.
            </p>
          </div>

        </div>

        {/* Contact Support Footer Box */}
        <div className="bg-white dark:bg-[#18181b] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-gray-950 flex items-center justify-center text-xl font-bold mx-auto shadow-md">
            <i className="fas fa-headset"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Need Help With A Refund or Cancellation?</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg mx-auto">
              Our support executive will process your cancellation or refund claim swiftly.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-800/80 px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
            <i className="fas fa-envelope"></i>
            <span>Email: support@cookmantra.com</span>
          </div>
          <div className="pt-2">
            <button
              onClick={onBackToHome}
              className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-amber-500 transition cursor-pointer underline"
            >
              Return to CookMantra Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
