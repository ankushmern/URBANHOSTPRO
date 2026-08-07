import React from 'react';

export const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-4 shadow-2xs animate-pulse space-y-3">
      <div className="w-full h-44 bg-gray-200 dark:bg-zinc-800 rounded-2xl"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-full w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-full w-1/5"></div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded-xl w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-lg w-full"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded-lg w-1/4"></div>
        <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-xl w-1/3"></div>
      </div>
    </div>
  );
};

export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full w-1/2"></div>
          <div className="h-7 bg-gray-200 dark:bg-zinc-800 rounded-xl w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

export const SectionHeaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 animate-pulse mb-6">
      <div className="h-4 bg-amber-500/20 dark:bg-amber-500/10 rounded-full w-28"></div>
      <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-2xl w-64"></div>
      <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-lg w-96 max-w-full"></div>
    </div>
  );
};

export const SectionLoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const PageSpinnerLoader: React.FC<{ message?: string }> = ({ message = 'Preparing gourmet culinary experience...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
        <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center text-lg">
          <i className="fas fa-utensils animate-bounce"></i>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wide uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
};
