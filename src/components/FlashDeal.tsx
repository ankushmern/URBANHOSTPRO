import React, { useState, useEffect } from 'react';

interface FlashDealProps {
  onOpenBooking: () => void;
  onQuickOrder?: (serviceDetail: string, serviceType?: string, price?: string) => void;
}

export const FlashDeal: React.FC<FlashDealProps> = ({ onOpenBooking, onQuickOrder }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTwoDigits = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <section
      className="relative overflow-hidden rounded-3xl shadow-2xl bg-[#121214] text-white p-5 sm:p-6 md:p-8 my-6 border border-zinc-800 dark:border-[#2D2D30] group"
      data-search="italian cuisine masterclass chef giovanni pasta deal 50% off"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <div className="flex-1 text-center md:text-left space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            Deal of the Day
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
            Master the Art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Italian Cuisine
            </span>
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto md:mx-0">
            Join Chef Giovanni for an exclusive live session. Learn handmade pasta from scratch.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (onQuickOrder) {
                  onQuickOrder('Italian Cuisine Masterclass with Chef Giovanni', 'Flash Deal', '₹49 (50% OFF)');
                } else {
                  onOpenBooking();
                }
              }}
              className="bg-white text-slate-900 hover:bg-yellow-400 transition font-bold py-2.5 px-6 md:py-3 md:px-8 rounded-full shadow-lg hover:shadow-yellow-400/50 flex items-center gap-2 mx-auto md:mx-0 group-hover:scale-105 transform cursor-pointer"
            >
              <span>Book for ₹49</span>
              <span className="text-xs line-through opacity-50">₹99</span>
              <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 relative transform transition hover:scale-105">
          <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 md:-top-8 md:-right-8 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400 text-slate-900 rounded-full flex flex-col items-center justify-center font-black text-sm sm:text-xl rotate-12 shadow-lg border-4 border-[#0f172a] z-20">
            <span>50%</span>
            <span className="text-[10px] font-bold -mt-1">OFF</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl shadow-2xl relative">
            <p className="text-center text-[10px] sm:text-xs font-medium text-slate-400 mb-3 sm:mb-4 uppercase tracking-widest">
              Offer Expires In
            </p>
            <div className="flex items-start gap-2 sm:gap-4 text-center justify-center">
              <div className="flex flex-col gap-1">
                <div className="w-10 h-12 sm:w-14 sm:h-16 bg-[#1e293b] rounded-lg flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-inner border-t border-white/5">
                  <span className="font-mono">{formatTwoDigits(timeLeft.hours)}</span>
                </div>
                <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase">Hrs</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-slate-600 mt-2 sm:mt-3">:</span>
              <div className="flex flex-col gap-1">
                <div className="w-10 h-12 sm:w-14 sm:h-16 bg-[#1e293b] rounded-lg flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-inner border-t border-white/5">
                  <span className="font-mono">{formatTwoDigits(timeLeft.minutes)}</span>
                </div>
                <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase">Mins</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-slate-600 mt-2 sm:mt-3">:</span>
              <div className="flex flex-col gap-1">
                <div className="w-10 h-12 sm:w-14 sm:h-16 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-lg relative overflow-hidden">
                  <span className="font-mono relative z-10">{formatTwoDigits(timeLeft.seconds)}</span>
                </div>
                <span className="text-[8px] sm:text-[10px] text-yellow-500 font-bold uppercase">Sec</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
