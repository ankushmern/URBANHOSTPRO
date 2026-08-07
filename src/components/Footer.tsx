import React, { useState } from 'react';
import { CookMantraLogo } from './CookMantraLogo';

interface FooterProps {
  setActiveSection: (sec: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveSection }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Trigger background mailto submission to owner
      const mailtoUrl = `mailto:ankush.manjute.it@gmail.com?subject=${encodeURIComponent('New CookMantra Newsletter Subscription')}&body=${encodeURIComponent(`Subscriber Email: ${email}`)}`;
      window.open(mailtoUrl, '_blank');
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3500);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.email && contactForm.message) {
      const mailtoUrl = `mailto:ankush.manjute.it@gmail.com?subject=${encodeURIComponent('CookMantra Support Query: ' + (contactForm.name || 'User'))}&body=${encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`)}`;
      window.open(mailtoUrl, '_blank');
      setSupportSent(true);
      setTimeout(() => {
        setSupportSent(false);
        setShowContactModal(false);
        setContactForm({ name: '', email: '', message: '' });
      }, 2500);
    }
  };

  const handleHomeReload = () => {
    setActiveSection('homeSection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-[#161618] rounded-3xl border border-zinc-200 dark:border-[#2D2D30] p-6 sm:p-8 mt-12 shadow-sm transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div
            className="mb-4 cursor-pointer inline-block"
            onClick={handleHomeReload}
            title="CookMantra - Click to reload Home"
          >
            <CookMantraLogo size="md" showText={true} />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Where taste meets perfection. We bring culinary excellence to your doorstep with top chefs, masterclasses, and event services.
          </p>
          <div className="flex space-x-3.5 mt-4 text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-amber-500 transition" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="hover:text-amber-500 transition" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-amber-500 transition" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-amber-500 transition" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3.5">Explore</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={handleHomeReload} className="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition cursor-pointer">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection('coursesSection')} className="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition cursor-pointer">
                Cooking Masterclasses
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection('weeklyPrepSection')} className="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition cursor-pointer">
                Weekly Meal Prep
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection('savedRecipesSection')} className="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition cursor-pointer">
                Wishlist & Saved Recipes
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection('dashboardSection')} className="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition cursor-pointer">
                Orders & Dashboard
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3.5">Support & Help</h4>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li>
              <button
                onClick={() => setShowContactModal(true)}
                className="hover:text-amber-500 font-medium transition cursor-pointer flex items-center gap-1.5 text-amber-600 dark:text-amber-400"
              >
                <i className="fas fa-headset text-amber-500"></i>
                <span>Contact Support</span>
              </button>
            </li>
            <li className="hover:text-amber-500 transition cursor-pointer" onClick={() => setShowContactModal(true)}>Frequently Asked Questions</li>
            <li>
              <button
                onClick={() => {
                  setActiveSection('privacyPolicySection');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.pushState({}, '', '/privacy-policy');
                }}
                className="hover:text-amber-500 font-medium transition cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveSection('termsOfServiceSection');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.pushState({}, '', '/terms-of-service');
                }}
                className="hover:text-amber-500 font-medium transition cursor-pointer text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveSection('cancellationPolicySection');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.pushState({}, '', '/cancellation-policy');
                }}
                className="hover:text-amber-500 font-medium transition cursor-pointer text-left"
              >
                Cancellation Policy
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3.5">Stay Updated</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Get the latest recipes and special discounts straight to your inbox.
          </p>
          {subscribed ? (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-xl text-xs font-semibold text-center">
              <i className="fas fa-check-circle mr-1"></i> Subscribed successfully! Thank you.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer active:scale-98 shadow-xs"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © 2026 CookMantra. All rights reserved. Crafted with <i className="fas fa-heart text-red-500"></i> for food lovers.
      </div>

      {/* Support & Help Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-md w-full border border-gray-200 dark:border-zinc-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs transition cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg font-bold">
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">CookMantra Support & Help</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Send us a message and our team will get back to you shortly.</p>
              </div>
            </div>

            {supportSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mx-auto">
                  <i className="fas fa-check"></i>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Message Sent Successfully!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your query has been dispatched directly to support.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Message / Help Request</label>
                  <textarea
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="How can we help you today?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs transition cursor-pointer active:scale-98 shadow-md"
                >
                  Send Support Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

