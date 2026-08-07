import React, { useState } from 'react';

export const WeeklyPrepSection: React.FC = () => {
  const [isVeg, setIsVeg] = useState(true);

  const vegSchedule = [
    {
      day: 'Monday',
      icon: 'fa-sun',
      special: 'Paneer Tikka Bowl (Dinner)',
      lunch: 'Paneer Bhurji + Roti',
      dinner: 'Paneer Tikka Bowl + Curd (High-Protein Comfort)',
    },
    {
      day: 'Tuesday',
      icon: 'fa-cloud-sun',
      special: 'Soya Chunk Masala (Lunch)',
      lunch: 'Soya Chunk Masala + Brown Rice (Protein Powerhouse)',
      dinner: 'Rajma Curry lite + Multigrain Roti',
    },
    {
      day: 'Wednesday',
      icon: 'fa-cloud-sun',
      special: 'Sprouts & Mushroom Curry (Lunch)',
      lunch: 'Sprouts Curry + Jowar Bhakri (Maharashtrian Classic)',
      dinner: 'Palak Paneer + Brown Rice',
    },
    {
      day: 'Thursday',
      icon: 'fa-cloud',
      special: 'Grilled Paneer Salad (Lunch)',
      lunch: 'Grilled Paneer Salad (Spicy Protein Hit)',
      dinner: 'Paneer Tikka Masala lite',
    },
    {
      day: 'Friday',
      icon: 'fa-cloud-rain',
      special: 'Paneer Tikka Masala lite (Dinner)',
      lunch: 'Mixed Dal + Seasonal Veggies',
      dinner: 'Paneer Tikka Masala lite + Quinoa (Grilled Delight)',
    },
    {
      day: 'Weekend',
      icon: 'fa-umbrella',
      special: 'Lite Veg Hyderabadi Biryani (Dinner)',
      lunch: 'Build-Your-Own Veg Bowl',
      dinner: 'Lite Veg Hyderabadi Biryani (Weekend Feast)',
    },
  ];

  const nonVegSchedule = [
    {
      day: 'Monday',
      icon: 'fa-sun',
      special: 'Chicken Tikka Bowl (Dinner)',
      lunch: 'Paneer Bhurji + Roti',
      dinner: 'Chicken Tikka Bowl + Curd (High-Protein Comfort)',
    },
    {
      day: 'Tuesday',
      icon: 'fa-cloud-sun',
      special: 'Masala Fish Tikka (Lunch)',
      lunch: 'Masala Fish Tikka + Brown Rice (Protein Powerhouse)',
      dinner: 'Rajma Curry lite + Multigrain Roti',
    },
    {
      day: 'Wednesday',
      icon: 'fa-cloud-sun',
      special: 'Egg Curry (Lunch)',
      lunch: 'Egg Curry + Jowar Bhakri (Maharashtrian Classic)',
      dinner: 'Palak Paneer + Brown Rice',
    },
    {
      day: 'Thursday',
      icon: 'fa-cloud',
      special: 'Grilled Chicken Salad (Lunch)',
      lunch: 'Grilled Chicken Salad (Spicy Protein Hit)',
      dinner: 'Paneer Tikka Masala lite',
    },
    {
      day: 'Friday',
      icon: 'fa-cloud-rain',
      special: 'Chicken Tikka Masala lite (Dinner)',
      lunch: 'Mixed Dal + Seasonal Veggies',
      dinner: 'Chicken Tikka Masala lite + Quinoa (Grilled Delight)',
    },
    {
      day: 'Weekend',
      icon: 'fa-umbrella',
      special: 'Lite Chicken Biryani (Dinner)',
      lunch: 'Build-Your-Own Veg Bowl',
      dinner: 'Lite Chicken Biryani (Weekend Feast)',
    },
  ];

  const currentSchedule = isVeg ? vegSchedule : nonVegSchedule;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 md:p-8 shadow-md border border-zinc-200 dark:border-[#2D2D30]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Weekly Meal Prep</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              High-Protein • Special Dish Daily • March 9–15, 2026
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl overflow-hidden border border-zinc-200 dark:border-[#2D2D30] p-1 bg-zinc-100 dark:bg-zinc-800">
              <button
                onClick={() => setIsVeg(true)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isVeg
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                Vegetarian
              </button>
              <button
                onClick={() => setIsVeg(false)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isVeg
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                Non-Veg
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-print"></i> Print List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSchedule.map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-200 dark:border-[#2D2D30] rounded-2xl p-5 bg-zinc-50/50 dark:bg-[#121214] hover:border-amber-500/40 hover:shadow-lg transition-all"
            >
              <h4 className="font-bold text-base text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <i className={`fas ${item.icon} text-amber-500`}></i>
                {item.day}
              </h4>

              <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div className={`border-l-4 pl-3 py-1.5 rounded-r-md ${
                  isVeg ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-400'
                }`}>
                  <span className={`font-bold ${isVeg ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    Special:
                  </span>{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{item.special}</span>
                </div>

                <div>
                  <span className="font-bold text-gray-900 dark:text-white">Lunch:</span> {item.lunch}
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">Dinner:</span> {item.dinner}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
