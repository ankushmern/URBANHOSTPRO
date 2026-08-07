import React from 'react';

interface NotFoundSectionProps {
  onGoHome: () => void;
  onExploreDishes?: () => void;
}

export const NotFoundSection: React.FC<NotFoundSectionProps> = ({
  onGoHome,
  onExploreDishes,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 my-8">
      <div className="max-w-md w-full bg-white dark:bg-[#161618] rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-full animate-ping"></div>
          <div className="relative w-20 h-20 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center text-3xl border border-amber-500/30 shadow-inner">
            <i className="fas fa-utensils"></i>
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            404 • Page Not Found
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Dish Not On The Menu
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            The page or dish recipe you requested could not be found or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onGoHome}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="fas fa-house"></i>
            <span>Back to Home</span>
          </button>
          {onExploreDishes && (
            <button
              onClick={onExploreDishes}
              className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fas fa-bowl-food"></i>
              <span>Explore Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
