import React, { useState } from 'react';
import { Recipe } from '../types';

interface WishlistSectionProps {
  recipes: Recipe[];
  savedIds: number[];
  onToggleSaved: (id: number) => void;
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (id: number) => void;
  onQuickOrder?: (serviceDetail: string, serviceType?: string, price?: string) => void;
  onBrowseDishes?: () => void;
}

export const WishlistSection: React.FC<WishlistSectionProps> = ({
  recipes,
  savedIds,
  onToggleSaved,
  onAddRecipe,
  onDeleteRecipe,
  onQuickOrder,
  onBrowseDishes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New dish form state
  const [newDishName, setNewDishName] = useState<string>('');
  const [newDishCuisine, setNewDishCuisine] = useState<string>('Indian');
  const [newDishCategory, setNewDishCategory] = useState<string>('Main Course');
  const [newDishTime, setNewDishTime] = useState<string>('25 min');
  const [newDishImg, setNewDishImg] = useState<string>('');

  const categories = ['All', 'Main Course', 'Pasta', 'Vegetarian', 'Desserts', 'Quick meals'];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered dishes calculation - ONLY dishes in savedIds wishlist
  const displayedRecipes = recipes.filter(r => {
    // Must be in savedIds wishlist
    if (!savedIds.includes(r.id)) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'All' && r.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    const created: Omit<Recipe, 'id'> = {
      name: newDishName.trim(),
      cuisine: newDishCuisine.trim() || 'Indian',
      category: newDishCategory || 'Main Course',
      time: newDishTime.trim() || '20 min',
      img:
        newDishImg.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    };

    onAddRecipe(created);

    triggerToast(`✨ Published "${created.name}" to catalog!`);
    setNewDishName('');
    setNewDishImg('');
    setNewDishTime('25 min');
    setAddModalOpen(false);
  };

  const handleToggle = (recipe: Recipe) => {
    const isCurrentlySaved = savedIds.includes(recipe.id);
    onToggleSaved(recipe.id);
    triggerToast(
      isCurrentlySaved
        ? `Removed "${recipe.name}" from Wishlist`
        : `❤️ Saved "${recipe.name}" to Wishlist!`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-amber-500 text-white dark:text-gray-950 px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-white/10 animate-bounce">
          <i className="fas fa-check-circle text-amber-400 dark:text-gray-950"></i>
          <span>{toastMessage}</span>
        </div>
      )}



      {/* Categories & Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#161618] p-3 rounded-2xl border border-zinc-200 dark:border-[#2D2D30]">
        {/* Wishlist Indicator Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-extrabold text-xs">
          <i className="fas fa-heart text-red-500"></i>
          <span>Wishlist Items</span>
          <span className="bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full font-black">
            {savedIds.length}
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-gray-950 font-bold'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Catalog Grid */}
      {displayedRecipes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#161618] rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3.5 text-2xl border border-red-500/20">
            {savedIds.length === 0 ? <i className="fas fa-heart"></i> : <i className="fas fa-search"></i>}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
            {savedIds.length === 0 ? 'Your Wishlist is Empty' : 'No matching wishlisted dishes'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-5">
            {savedIds.length === 0
              ? 'Click the heart (❤️) icon on any dish card to add it to your personal wishlist.'
              : 'Try clearing your search query or category filter to view saved items.'}
          </p>
          {savedIds.length === 0 ? (
            <button
              onClick={() => {
                if (onBrowseDishes) {
                  onBrowseDishes();
                } else {
                  setSelectedCategory('All');
                }
              }}
              className="px-5 py-2.5 bg-amber-500 text-gray-950 text-xs font-extrabold rounded-xl shadow-md hover:bg-amber-600 transition cursor-pointer flex items-center gap-2 mx-auto"
            >
              <i className="fas fa-utensils"></i>
              <span>Browse Gourmet Dishes</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedRecipes.map(recipe => {
            const isSaved = savedIds.includes(recipe.id);
            return (
              <div
                key={recipe.id}
                className="bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200/80 dark:border-[#2D2D30] overflow-hidden hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Container */}
                <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={recipe.img}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Heart Button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(recipe)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer z-10 ${
                      isSaved
                        ? 'bg-red-500 text-white ring-2 ring-red-200 dark:ring-red-900 scale-105'
                        : 'bg-black/40 hover:bg-red-500 backdrop-blur-md text-white hover:scale-110'
                    }`}
                    title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <i className={`${isSaved ? 'fas' : 'far'} fa-heart text-xs`}></i>
                  </button>

                  {/* Time & Cuisine Badge */}
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white flex items-center gap-1.5">
                    <i className="far fa-clock text-[9px] text-amber-400"></i>
                    <span>{recipe.time}</span>
                    <span className="text-gray-400">•</span>
                    <span>{recipe.cuisine}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-md inline-block mb-1.5">
                      {recipe.category}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {recipe.name}
                    </h4>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    {onQuickOrder ? (
                      <button
                        onClick={() => onQuickOrder(recipe.name, 'Meal Cook', '₹399')}
                        className="w-full bg-gray-100 dark:bg-zinc-800/90 hover:bg-amber-500 hover:text-gray-950 text-gray-800 dark:text-gray-200 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fas fa-utensils text-[10px]"></i>
                        <span>Book Cook for Dish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggle(recipe)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSaved
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-amber-500 hover:text-gray-950'
                        }`}
                      >
                        <i className={`${isSaved ? 'fas' : 'far'} fa-heart text-[10px]`}></i>
                        <span>{isSaved ? 'In Wishlist' : 'Add to Wishlist'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteRecipe(recipe.id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                      title="Delete dish from catalog"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Dish Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161618] rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white text-base w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg">
                <i className="fas fa-utensils"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Dish</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Create a custom dish recipe to save in catalog & wishlist.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddDishSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Dish Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={e => setNewDishName(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full bg-gray-50 dark:bg-zinc-900 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Cuisine</label>
                  <select
                    value={newDishCuisine}
                    onChange={e => setNewDishCuisine(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Indian">Indian</option>
                    <option value="Italian">Italian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="South Indian">South Indian</option>
                    <option value="French">French</option>
                    <option value="Continental">Continental</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={newDishCategory}
                    onChange={e => setNewDishCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Quick meals">Quick meals</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Prep Time</label>
                <input
                  type="text"
                  value={newDishTime}
                  onChange={e => setNewDishTime(e.target.value)}
                  placeholder="25 min"
                  className="w-full bg-gray-50 dark:bg-zinc-900 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={newDishImg}
                  onChange={e => setNewDishImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-50 dark:bg-zinc-900 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold shadow-xs transition cursor-pointer active:scale-98"
                >
                  Create Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
