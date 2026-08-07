import React from 'react';
import { CookMantraLogo } from '../CookMantraLogo';

interface LegalPageProps {
  onBackToHome: () => void;
}

export const TermsOfService: React.FC<LegalPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121214] text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3">
            <CookMantraLogo size="sm" showText={true} />
            <span className="hidden sm:inline-block text-gray-300 dark:text-zinc-700">|</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
              User Agreement
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
              <i className="fas fa-file-contract text-xs"></i>
              <span>CookMantra Platform Guidelines</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-gray-900/90 font-medium leading-relaxed">
              Please read these terms carefully before accessing CookMantra's Food Ordering, Chef Booking, Weekly Meal Prep, Masterclass, and Catering services.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-gray-950/80">
              <i className="far fa-calendar-alt"></i>
              <span>Last Updated: July 31, 2026</span>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              1. Acceptance of Terms
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              By accessing CookMantra, creating an account, or placing bookings/orders, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-utensils"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              2. Scope of Services
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              CookMantra provides a multi-service culinary platform including:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
              <li><strong>Food Ordering:</strong> Delivery of trial dishes and specialty meals.</li>
              <li><strong>Chef Booking:</strong> On-demand booking of verified home chefs.</li>
              <li><strong>Weekly Meal Prep:</strong> Custom weekly meal prep planning.</li>
              <li><strong>Cooking Masterclasses:</strong> Live interactive chef classes.</li>
              <li><strong>Event Catering:</strong> Tailored catering for private events.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-user-cog"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              3. User Responsibilities & Conduct
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Users must provide accurate contact information, valid delivery addresses, and disclose any severe food allergies before service commencement. When booking in-home chefs, users must provide a safe and clean kitchen environment.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-credit-card"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              4. Pricing & Payment Terms
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              All prices displayed are inclusive of applicable taxes unless stated otherwise. Payments can be made online via UPI/Razorpay or Cash on Delivery where supported. Bookings are confirmed upon valid payment or UTR verification.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-hand-sparkles"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              5. Food Safety & Hygiene Standards
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              CookMantra chefs adhere to rigorous hygiene protocols. Fresh ingredients provided by CookMantra are inspected for quality. Users providing their own ingredients for chef cooking accept responsibility for ingredient freshness.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
              <i className="fas fa-copyright"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              6. Intellectual Property
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              All materials, masterclass video content, recipes, design elements, and logos featured on CookMantra are the exclusive property of CookMantra and protected by copyright laws. Unauthorized distribution is strictly prohibited.
            </p>
          </div>

        </div>

        {/* Contact Support Footer Box */}
        <div className="bg-white dark:bg-[#18181b] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-gray-950 flex items-center justify-center text-xl font-bold mx-auto shadow-md">
            <i className="fas fa-file-signature"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Questions About Our Terms?</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg mx-auto">
              For any clarifications regarding our platform rules or service contracts, reach out to support.
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
