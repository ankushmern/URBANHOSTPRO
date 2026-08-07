import React from 'react';
import { CookMantraLogo } from '../CookMantraLogo';

interface LegalPageProps {
  onBackToHome: () => void;
}

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121214] text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3">
            <CookMantraLogo size="sm" showText={true} />
            <span className="hidden sm:inline-block text-gray-300 dark:text-zinc-700">|</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
              Legal Document
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
              <i className="fas fa-shield-alt text-xs"></i>
              <span>CookMantra Trust & Data Security</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-900/90 font-medium leading-relaxed">
              How CookMantra collects, uses, protects, and handles your personal information across our Food Ordering, Chef Booking, Weekly Meal Prep, Masterclass, and Event Catering services.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-gray-950/80">
              <i className="far fa-calendar-alt"></i>
              <span>Last Updated: July 31, 2026</span>
            </div>
          </div>
        </div>

        {/* Content Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-user-shield"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              1. Information We Collect
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
              To provide seamless culinary services, CookMantra collects essential information when you register or place requests:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
              <li><strong className="text-gray-800 dark:text-gray-200">Account Details:</strong> Name, phone number, email address, and delivery addresses.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Order & Booking Data:</strong> Meal selections, dietary restrictions, preferred delivery times, and event requirements.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Payment Metadata:</strong> Transaction IDs, UTR numbers, and payment status handled through secure payment partners (e.g. Razorpay/UPI).</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-cogs"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              2. How We Use Your Information
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              We utilize your data strictly to execute, improve, and personalize our services:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
              <li>Dispatching professional home chefs to your designated address.</li>
              <li>Preparing and delivering weekly meal prep boxes and food orders.</li>
              <li>Enrolling you into live masterclass sessions and sending access credentials.</li>
              <li>Sending order status notifications, receipts, and support communications.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-share-alt"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              3. Information Sharing & Confidentiality
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              CookMantra respects your privacy. We strictly <strong>NEVER sell or rent</strong> your personal information to third parties. Data is shared exclusively on a need-to-know basis with:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
              <li><strong>Assigned Home Chefs:</strong> Provided necessary contact & address info for home cooking visits.</li>
              <li><strong>Delivery Logistics Partners:</strong> For dispatching fresh meals and prep ingredients.</li>
              <li><strong>Payment Gateways:</strong> Encrypted transfer for verifying payment status.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-lock"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              4. Data Security & Storage
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              We employ industry-standard technical measures including SSL/TLS encryption, JWT authentication tokens, and strict access controls to safeguard your data. User profiles and order histories are safely isolated per account.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-cookie-bite"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              5. Local Storage & Preferences
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              CookMantra uses browser local storage exclusively for essential app functionalities such as maintaining your active login session, saved wishlist recipes, dark mode preference, and cart items without using intrusive third-party tracking scripts.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-user-check"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              6. Your Data Rights & Control
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              You have the right to view, update, or correct your personal information at any time via your Profile Modal in CookMantra. You may also request account deletion or data export by contacting support.
            </p>
          </div>

        </div>

        {/* Contact Support Footer Box */}
        <div className="bg-white dark:bg-[#18181b] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-gray-950 flex items-center justify-center text-xl font-bold mx-auto shadow-md">
            <i className="fas fa-envelope-open-text"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Have Privacy Questions?</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg mx-auto">
              Our support team is here to assist you with any questions regarding data protection or account security.
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
