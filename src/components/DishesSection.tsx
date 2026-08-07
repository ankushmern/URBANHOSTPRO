import React, { useState } from 'react';

interface DishesSectionProps {
  onOpenBooking: () => void;
  onQuickOrder?: (serviceDetail: string, serviceType?: string, price?: string) => void;
  savedIds?: number[];
  onToggleSaved?: (id: number, dishData?: any) => void;
}

interface DishItem {
  id: number;
  title: string;
  badge?: string;
  badgeBg?: string;
  rating: string;
  reviews: string;
  desc: string;
  price: string;
  originalPrice?: string;
  img: string;
  cuisine?: string;
  category?: string;
  prepTime?: string;
  isCustom?: boolean;
}

export const DishesSection: React.FC<DishesSectionProps> = ({
  onOpenBooking,
  onQuickOrder,
  savedIds,
  onToggleSaved,
}) => {
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Fallback local wishlist state if savedIds not passed
  const [localWishlist, setLocalWishlist] = useState<number[]>(() => {
    const saved = localStorage.getItem('cookmantra_dishes_wishlist');
    return saved ? JSON.parse(saved) : [1, 2, 3];
  });

  const activeWishlist = savedIds || localWishlist;

  const handleToggleWishlist = (course: DishItem) => {
    const isLiked = activeWishlist.includes(course.id);
    if (onToggleSaved) {
      onToggleSaved(course.id, {
        name: course.title,
        cuisine: course.cuisine || 'Indian',
        category: course.category || 'Main Course',
        time: course.prepTime || '20 min',
        img: course.img,
      });
    } else {
      const next = isLiked ? localWishlist.filter(id => id !== course.id) : [...localWishlist, course.id];
      setLocalWishlist(next);
      localStorage.setItem('cookmantra_dishes_wishlist', JSON.stringify(next));
      setToastMessage(isLiked ? `Removed "${course.title}" from Wishlist` : `❤️ Added "${course.title}" to Wishlist!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Top Popular Dishes & Weekly Special Catalog
  const [courses, setCourses] = useState<DishItem[]>([
    // --- ₹9 Super Offer & Special Trial Dish ---
    {
      id: 900,
      title: 'CookMantra ₹9 Special Gourmet Trial Dish',
      badge: '🔥 ₹9 Special Deal',
      badgeBg: 'bg-rose-600 text-white animate-pulse',
      rating: '5.0',
      reviews: '1,890',
      desc: 'Exclusive fresh chef-cooked special dish. Limited period introductory price of just ₹9!',
      price: '₹9',
      originalPrice: '₹149',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '15 min',
    },
    // --- Veg Weekly Specials & Daily Meals ---
    {
      id: 101,
      title: 'Paneer Tikka Bowl + Curd (High-Protein Comfort)',
      badge: 'Monday Dinner Special',
      badgeBg: 'bg-emerald-500 text-white',
      rating: '4.9',
      reviews: '520',
      desc: 'Tender grilled paneer tikka served over fragrant rice with fresh seasoned curd.',
      price: '₹159',
      originalPrice: '₹199',
      img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 102,
      title: 'Paneer Bhurji + Roti',
      badge: 'Monday Lunch',
      badgeBg: 'bg-amber-500 text-black',
      rating: '4.8',
      reviews: '430',
      desc: 'Spiced scrambled cottage cheese cooked with onions, tomatoes, and fresh coriander served with warm wheat rotis.',
      price: '₹129',
      originalPrice: '₹159',
      img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '15 min',
    },
    {
      id: 103,
      title: 'Soya Chunk Masala + Brown Rice (Protein Powerhouse)',
      badge: 'Tuesday Lunch Special',
      badgeBg: 'bg-amber-500 text-black',
      rating: '4.9',
      reviews: '390',
      desc: 'High-protein soya chunks simmered in aromatic gravy served with fiber-rich brown rice.',
      price: '₹139',
      originalPrice: '₹179',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '20 min',
    },
    {
      id: 104,
      title: 'Rajma Curry lite + Multigrain Roti',
      badge: 'Tuesday Dinner',
      badgeBg: 'bg-zinc-800 text-white',
      rating: '4.8',
      reviews: '480',
      desc: 'Slow-cooked red kidney bean curry with light spices, paired with healthy multigrain rotis.',
      price: '₹119',
      originalPrice: '₹149',
      img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 105,
      title: 'Sprouts Curry + Jowar Bhakri (Maharashtrian Classic)',
      badge: 'Wednesday Lunch Special',
      badgeBg: 'bg-orange-500 text-white',
      rating: '4.9',
      reviews: '310',
      desc: 'Nutritious sprouted moth bean curry served with traditional healthy Jowar Bhakri flatbread.',
      price: '₹129',
      originalPrice: '₹159',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '20 min',
    },
    {
      id: 106,
      title: 'Palak Paneer + Brown Rice',
      badge: 'Wednesday Dinner',
      badgeBg: 'bg-emerald-600 text-white',
      rating: '4.8',
      reviews: '510',
      desc: 'Fresh spinach puree cooked with soft paneer cubes, served with steamed brown rice.',
      price: '₹149',
      originalPrice: '₹189',
      img: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 107,
      title: 'Grilled Paneer Salad (Spicy Protein Hit)',
      badge: 'Thursday Lunch Special',
      badgeBg: 'bg-red-500 text-white',
      rating: '4.9',
      reviews: '410',
      desc: 'Tandoori marinated cottage cheese grilled to perfection with bell peppers, greens & tangy mint dressing.',
      price: '₹149',
      originalPrice: '₹189',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Healthy',
      category: 'Starters',
      prepTime: '15 min',
    },
    {
      id: 108,
      title: 'Paneer Tikka Masala lite + Quinoa (Grilled Delight)',
      badge: 'Friday Dinner Special',
      badgeBg: 'bg-amber-600 text-white',
      rating: '5.0',
      reviews: '620',
      desc: 'Chargrilled paneer tikka in light masala sauce paired with superfood protein quinoa.',
      price: '₹169',
      originalPrice: '₹219',
      img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 109,
      title: 'Mixed Dal + Seasonal Veggies',
      badge: 'Friday Lunch',
      badgeBg: 'bg-yellow-600 text-white',
      rating: '4.7',
      reviews: '340',
      desc: 'Comforting yellow dal tadka paired with fresh farm seasonal sautéed vegetables.',
      price: '₹119',
      originalPrice: '₹149',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '20 min',
    },
    {
      id: 110,
      title: 'Lite Veg Hyderabadi Biryani (Weekend Feast)',
      badge: 'Weekend Special',
      badgeBg: 'bg-purple-600 text-white',
      rating: '5.0',
      reviews: '890',
      desc: 'Fragrant basmati rice layered with spiced vegetables, saffron, and mint leaves.',
      price: '₹179',
      originalPrice: '₹229',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '35 min',
    },
    {
      id: 111,
      title: 'Build-Your-Own Veg Bowl',
      badge: 'Weekend Lunch',
      badgeBg: 'bg-teal-500 text-white',
      rating: '4.8',
      reviews: '280',
      desc: 'Customize your wholesome bowl with choice of grains, grilled proteins, veggies, and house dressing.',
      price: '₹149',
      originalPrice: '₹189',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Healthy',
      category: 'Main Course',
      prepTime: '15 min',
    },

    // --- Non-Veg Weekly Specials & Daily Meals ---
    {
      id: 112,
      title: 'Chicken Tikka Bowl + Curd (High-Protein Comfort)',
      badge: 'Monday Special Non-Veg',
      badgeBg: 'bg-rose-500 text-white',
      rating: '5.0',
      reviews: '740',
      desc: 'Succulent tandoori chicken tikka over aromatic rice served with cooling herb curd.',
      price: '₹189',
      originalPrice: '₹239',
      img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 113,
      title: 'Masala Fish Tikka + Brown Rice (Protein Powerhouse)',
      badge: 'Tuesday Special Non-Veg',
      badgeBg: 'bg-blue-600 text-white',
      rating: '4.9',
      reviews: '410',
      desc: 'Juicy spiced roasted fish fillet served with fluffy steamed brown rice and lemon mint chutney.',
      price: '₹199',
      originalPrice: '₹249',
      img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 114,
      title: 'Egg Curry + Jowar Bhakri (Maharashtrian Classic)',
      badge: 'Wednesday Special Non-Veg',
      badgeBg: 'bg-amber-600 text-white',
      rating: '4.8',
      reviews: '360',
      desc: 'Boiled eggs cooked in rich spicy Maharashtrian coconut gravy paired with warm Jowar Bhakri.',
      price: '₹139',
      originalPrice: '₹179',
      img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '20 min',
    },
    {
      id: 115,
      title: 'Grilled Chicken Salad (Spicy Protein Hit)',
      badge: 'Thursday Special Non-Veg',
      badgeBg: 'bg-red-600 text-white',
      rating: '4.9',
      reviews: '530',
      desc: 'Herb grilled lean chicken breast over crisp romaine, cherry tomatoes, and zesty chili dressing.',
      price: '₹179',
      originalPrice: '₹219',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Healthy',
      category: 'Main Course',
      prepTime: '15 min',
    },
    {
      id: 116,
      title: 'Chicken Tikka Masala lite + Quinoa (Grilled Delight)',
      badge: 'Friday Special Non-Veg',
      badgeBg: 'bg-purple-600 text-white',
      rating: '5.0',
      reviews: '810',
      desc: 'Tender chicken tikka in tomato cream sauce served with protein-rich superfood quinoa.',
      price: '₹199',
      originalPrice: '₹249',
      img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '30 min',
    },
    {
      id: 117,
      title: 'Lite Chicken Biryani (Weekend Feast)',
      badge: 'Weekend Special Non-Veg',
      badgeBg: 'bg-amber-500 text-black',
      rating: '5.0',
      reviews: '950',
      desc: 'Dum-cooked chicken biryani with aromatic basmati, caramelized onions, and cucumber raita.',
      price: '₹199',
      originalPrice: '₹249',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '35 min',
    },

    // --- Classics ---
    {
      id: 1,
      title: 'Paneer Butter Masala & Lachha Paratha',
      badge: 'Bestseller',
      badgeBg: 'bg-amber-500 text-black',
      rating: '4.9',
      reviews: '640',
      desc: 'Cottage cheese cubes simmered in rich tomato cashew gravy served with crispy multi-layered parathas.',
      price: '₹149',
      originalPrice: '₹199',
      img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 2,
      title: 'Royal Hyderabadi Dum Biryani',
      badge: 'Chef Choice',
      badgeBg: 'bg-amber-500 text-black',
      rating: '5.0',
      reviews: '820',
      desc: 'Aromatic long-grain basmati rice cooked with saffron, rich spices, marinated vegetables or chicken.',
      price: '₹169',
      originalPrice: '₹219',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '35 min',
    },
    {
      id: 3,
      title: 'Chef Butter Chicken & Garlic Naan',
      badge: 'Trending',
      badgeBg: 'bg-red-500 text-white',
      rating: '4.9',
      reviews: '750',
      desc: 'Velvety tomato cashew gravy with tender tandoori morsels served with hot butter garlic naan.',
      price: '₹179',
      originalPrice: '₹229',
      img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '30 min',
    },
    {
      id: 4,
      title: 'Italian Pasta Mastery',
      badge: 'Masterclass',
      badgeBg: 'bg-yellow-500 text-black',
      rating: '4.8',
      reviews: '312',
      desc: 'Learn authentic handmade tagliatelle, creamy carbonara, arrabbiata, and tiramisu.',
      price: '₹129',
      originalPrice: '₹169',
      img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Italian',
      category: 'Masterclass',
      prepTime: '40 min',
    },
    {
      id: 5,
      title: 'Artisan Wood-Fired Neapolitan Pizza',
      badge: 'Must Try',
      badgeBg: 'bg-orange-500 text-white',
      rating: '4.9',
      reviews: '420',
      desc: 'Hand-stretched sourdough pizza topped with San Marzano tomatoes, fresh mozzarella, and basil.',
      price: '₹199',
      originalPrice: '₹249',
      img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Italian',
      category: 'Main Course',
      prepTime: '20 min',
    },
    {
      id: 6,
      title: 'Dal Makhani & Jeera Rice Combo',
      badge: 'Popular',
      badgeBg: 'bg-emerald-500 text-white',
      rating: '4.8',
      reviews: '510',
      desc: 'Slow-cooked black lentils simmered overnight with cream and butter, paired with fragrant cumin rice.',
      price: '₹119',
      originalPrice: '₹149',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 7,
      title: 'Tandoori Sizzler Platter & Mint Chutney',
      badge: 'Special',
      badgeBg: 'bg-purple-500 text-white',
      rating: '4.9',
      reviews: '380',
      desc: 'An assortment of paneer tikka, seekh kebabs, roasted vegetables served sizzling with chutney.',
      price: '₹229',
      originalPrice: '₹279',
      img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Starters',
      prepTime: '20 min',
    },
    {
      id: 8,
      title: 'French Cuisine Basics & Soufflé',
      badge: '-20%',
      badgeBg: 'bg-red-500 text-white',
      rating: '4.9',
      reviews: '178',
      desc: 'Master foundational French sauces, cheese soufflés, and classic bistro techniques with Chef Laurent.',
      price: '₹139',
      originalPrice: '₹179',
      img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop',
      cuisine: 'French',
      category: 'Masterclass',
      prepTime: '45 min',
    },
    {
      id: 9,
      title: 'Authentic Thai Street Pad Thai',
      badge: 'Hot',
      badgeBg: 'bg-red-600 text-white',
      rating: '5.0',
      reviews: '203',
      desc: 'Wok-tossed rice noodles with tofu/shrimp, bean sprouts, crushed peanuts, and tamarind glaze.',
      price: '₹129',
      img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Thai',
      category: 'Main Course',
      prepTime: '15 min',
    },
    {
      id: 10,
      title: 'BBQ & Smoked Grilling Feast',
      badge: 'New',
      badgeBg: 'bg-green-500 text-white',
      rating: '4.7',
      reviews: '194',
      desc: 'Smoked grilled ribs, paneer skewers, charred corn on the cob, and house signature sauces.',
      price: '₹159',
      originalPrice: '₹199',
      img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop',
      cuisine: 'American',
      category: 'Starters',
      prepTime: '30 min',
    },
    {
      id: 11,
      title: 'Japanese Sushi & Sashimi Platter',
      badge: 'Chef Choice',
      badgeBg: 'bg-amber-500 text-black',
      rating: '4.9',
      reviews: '310',
      desc: 'Fresh avocado rolls, salmon sashimi, tempura crunch, served with wasabi and pickled ginger.',
      price: '₹249',
      originalPrice: '₹299',
      img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Japanese',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 12,
      title: 'Crispy Hakka Noodles & Chili Manchurian',
      badge: 'Popular',
      badgeBg: 'bg-blue-500 text-white',
      rating: '4.8',
      reviews: '490',
      desc: 'Wok-fried Indo-Chinese noodles served with spicy crispy vegetable Manchurian balls in rich gravy.',
      price: '₹119',
      originalPrice: '₹149',
      img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Chinese',
      category: 'Main Course',
      prepTime: '20 min',
    },
    {
      id: 13,
      title: 'South Indian Crispy Masala Dosa',
      rating: '4.8',
      reviews: '387',
      desc: 'Golden crispy fermented crepe stuffed with spiced potato masala, served with 3 chutneys & sambar.',
      price: '₹89',
      img: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Starters',
      prepTime: '15 min',
    },
    {
      id: 14,
      title: 'Mexican Loaded Tacos & Guacamole',
      badge: 'New',
      badgeBg: 'bg-emerald-500 text-white',
      rating: '4.7',
      reviews: '165',
      desc: 'Soft corn tortillas filled with seasoned veggies, salsa, sour cream, and homemade guacamole.',
      price: '₹139',
      originalPrice: '₹169',
      img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Mexican',
      category: 'Starters',
      prepTime: '15 min',
    },
    {
      id: 15,
      title: 'Creamy Malai Kofta Deluxe',
      badge: 'Royal',
      badgeBg: 'bg-yellow-600 text-white',
      rating: '4.9',
      reviews: '280',
      desc: 'Fried cottage cheese and potato dumplings in a smooth, mild cashew nut and cream gravy.',
      price: '₹159',
      originalPrice: '₹189',
      img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '25 min',
    },
    {
      id: 16,
      title: 'Spanish Seafood & Saffron Paella',
      badge: 'Exotic',
      badgeBg: 'bg-rose-500 text-white',
      rating: '4.8',
      reviews: '142',
      desc: 'Traditional rice dish with saffron, bell peppers, fresh herbs, prawns, and lemon wedges.',
      price: '₹229',
      img: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Spanish',
      category: 'Main Course',
      prepTime: '35 min',
    },
    {
      id: 17,
      title: 'Classic Chole Bhature Special',
      badge: 'Bestseller',
      badgeBg: 'bg-amber-500 text-black',
      rating: '4.9',
      reviews: '610',
      desc: 'Spicy chickpeas cooked in authentic Punjabi spices served with fluffy fried bhatura and pickles.',
      price: '₹99',
      originalPrice: '₹129',
      img: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Main Course',
      prepTime: '20 min',
    },
    {
      id: 18,
      title: 'Molten Chocolate Lava Cake & Gelato',
      badge: 'Dessert',
      badgeBg: 'bg-pink-600 text-white',
      rating: '5.0',
      reviews: '530',
      desc: 'Warm chocolate cake with a gooey dark chocolate center served with vanilla gelato.',
      price: '₹89',
      originalPrice: '₹119',
      img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&auto=format&fit=crop',
      cuisine: 'French',
      category: 'Desserts',
      prepTime: '15 min',
    },
    {
      id: 19,
      title: 'Craft Mojito & Artisanal Mocktails',
      badge: 'Refreshment',
      badgeBg: 'bg-teal-500 text-white',
      rating: '4.9',
      reviews: '210',
      desc: 'Fresh mint, crushed lime, sparkling soda, passionfruit syrup, and custom garnish ice cubes.',
      price: '₹79',
      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Drinks',
      category: 'Drinks',
      prepTime: '10 min',
    },
    {
      id: 20,
      title: 'Royal Gulab Jamun & Rasmalai Platter',
      badge: 'Sweet Treat',
      badgeBg: 'bg-amber-600 text-white',
      rating: '5.0',
      reviews: '410',
      desc: 'Warm soft gulab jamuns soaked in rose syrup alongside chilled pistachio saffron rasmalai.',
      price: '₹99',
      originalPrice: '₹129',
      img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop',
      cuisine: 'Indian',
      category: 'Desserts',
      prepTime: '10 min',
    },
  ]);

  // Form state for adding custom dish with user's exact requested fields
  const [newDish, setNewDish] = useState({
    title: '',
    price: '',
    originalPrice: '',
    cuisine: 'Italian',
    category: 'Main Course',
    prepTime: '25 min',
    img: '',
    desc: '',
  });

  const categories = ['All', 'Main Course', 'Starters', 'Drinks', 'Desserts', 'Masterclass'];

  const filteredCourses = selectedCategory === 'All'
    ? courses
    : courses.filter(c => c.category === selectedCategory || (selectedCategory === 'Main Course' && !c.category));

  const handleBuy = (course: DishItem) => {
    if (!enrolledCourses.includes(course.id)) {
      setEnrolledCourses([...enrolledCourses, course.id]);
    }
    if (onQuickOrder) {
      onQuickOrder(course.title, course.category || 'Dish', course.price);
    } else {
      setToastMessage(`Successfully ordered/enrolled in "${course.title}"!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.title.trim()) return;

    const formattedPrice = newDish.price.startsWith('₹') ? newDish.price : `₹${newDish.price || '99'}`;
    const formattedOriginal = newDish.originalPrice ? (newDish.originalPrice.startsWith('₹') ? newDish.originalPrice : `₹${newDish.originalPrice}`) : undefined;

    const addedDish: DishItem = {
      id: Date.now(),
      title: newDish.title.trim(),
      badge: 'New Dish',
      badgeBg: 'bg-emerald-500 text-white',
      rating: '5.0',
      reviews: '1',
      desc: newDish.desc.trim() || `Freshly prepared chef special ${newDish.cuisine} dish crafted with authentic ingredients.`,
      price: formattedPrice,
      originalPrice: formattedOriginal,
      img: newDish.img.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
      cuisine: newDish.cuisine,
      category: newDish.category,
      prepTime: newDish.prepTime || '25 min',
      isCustom: true,
    };

    setCourses([addedDish, ...courses]);
    setIsAddDishModalOpen(false);
    setNewDish({
      title: '',
      price: '',
      originalPrice: '',
      cuisine: 'Italian',
      category: 'Main Course',
      prepTime: '25 min',
      img: '',
      desc: '',
    });

    setToastMessage(`✨ Published "${addedDish.title}" live!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-yellow-400 animate-bounce">
          <i className="fas fa-check-circle text-green-400 text-lg"></i>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Dishes & Masterclasses</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold">
              {courses.length} Available
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Learn directly from world-class chefs or order your custom favorite dish
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddDishModalOpen(true)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <i className="fas fa-plus-circle text-sm"></i> Add New Dish
          </button>
          <button
            onClick={onOpenBooking}
            className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <i className="fas fa-calendar-alt"></i> Private Class
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-gray-950 shadow-md scale-102'
                : 'bg-gray-100 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat} {cat === 'All' ? `(${courses.length})` : ''}
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 text-2xl">
              <i className="fas fa-utensils"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Dishes Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
              There are currently no dishes available in this category filter.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 bg-amber-500 text-gray-950 text-xs font-bold rounded-xl shadow-md hover:bg-amber-600 transition cursor-pointer"
            >
              Show All Dishes
            </button>
          </div>
        ) : (
          filteredCourses.map(course => {
            const isEnrolled = enrolledCourses.includes(course.id);
            const isLiked = activeWishlist.includes(course.id);
            return (
              <div
                key={course.id}
                className={`bg-white dark:bg-[#161618] rounded-2xl p-5 shadow-sm border ${
                  course.isCustom ? 'border-amber-500/50 dark:border-amber-500/40' : 'border-zinc-200 dark:border-[#2D2D30]'
                } hover:border-amber-500/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group`}
              >
                {course.isCustom && (
                  <span className="absolute top-3 left-3 z-10 bg-amber-500 text-gray-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <i className="fas fa-sparkles text-[9px]"></i> Custom Dish
                  </span>
                )}

                <div>
                  <div className="relative mb-4 rounded-xl overflow-hidden h-48 bg-zinc-100 dark:bg-zinc-800">
                    <img src={course.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={course.title} />

                    {/* Heart / Like Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(course);
                      }}
                      title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
                      className={`absolute top-3 ${course.isCustom ? 'left-28' : 'left-3'} z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                        isLiked
                          ? 'bg-red-500 text-white scale-110 ring-2 ring-red-300 dark:ring-red-900 shadow-red-500/50'
                          : 'bg-black/50 hover:bg-red-500 backdrop-blur-md text-white hover:text-white hover:scale-110'
                      }`}
                    >
                      <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-sm transition-transform active:scale-125`}></i>
                    </button>

                    {course.badge && (
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${course.badgeBg || 'bg-amber-500 text-black'}`}>
                        {course.badge}
                      </span>
                    )}
                    {course.prepTime && (
                      <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white flex items-center gap-1">
                        <i className="far fa-clock text-[9px]"></i> {course.prepTime}
                      </span>
                    )}
                  </div>

                <div className="flex items-center gap-2 mb-1">
                  {course.cuisine && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {course.cuisine}
                    </span>
                  )}
                  {course.category && (
                    <span className="text-[10px] font-semibold text-gray-400">
                      • {course.category}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">{course.title}</h3>

                <div className="flex items-center gap-1 mt-1 mb-2">
                  <i className="fas fa-star text-amber-400 text-xs"></i>
                  <span className="text-xs font-bold text-gray-900 dark:text-white ml-1">{course.rating}</span>
                  <span className="text-xs text-gray-400">({course.reviews} reviews)</span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{course.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-[#27272A]">
                <div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{course.price}</span>
                  {course.originalPrice && (
                    <span className="text-xs line-through text-gray-400 ml-1.5">{course.originalPrice}</span>
                  )}
                </div>

                <button
                  onClick={() => handleBuy(course)}
                  disabled={isEnrolled}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isEnrolled
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                  }`}
                >
                  <i className={`fas ${isEnrolled ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                  {isEnrolled ? 'Ordered' : 'Buy Now'}
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Add New Dish Modal matching exact requested layout */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-[#161618] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative my-8">
            <button
              onClick={() => setIsAddDishModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1 rounded-lg transition cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg">
                <i className="fas fa-utensils"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Dish</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter details to create and publish a new available dish live.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddDishSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Dish Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDish.title}
                  onChange={e => setNewDish({ ...newDish, title: e.target.value })}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDish.price}
                    onChange={e => setNewDish({ ...newDish, price: e.target.value })}
                    placeholder="149"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="text"
                    value={newDish.originalPrice}
                    onChange={e => setNewDish({ ...newDish, originalPrice: e.target.value })}
                    placeholder="199"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Cuisine
                  </label>
                  <select
                    value={newDish.cuisine}
                    onChange={e => setNewDish({ ...newDish, cuisine: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Italian">Italian</option>
                    <option value="Indian">Indian</option>
                    <option value="French">French</option>
                    <option value="Thai">Thai</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Spanish">Spanish</option>
                    <option value="American">American</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newDish.category}
                    onChange={e => setNewDish({ ...newDish, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Masterclass">Masterclass</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Preparation Time
                </label>
                <input
                  type="text"
                  value={newDish.prepTime}
                  onChange={e => setNewDish({ ...newDish, prepTime: e.target.value })}
                  placeholder="25 min"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newDish.img}
                  onChange={e => setNewDish({ ...newDish, img: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDish.desc}
                  onChange={e => setNewDish({ ...newDish, desc: e.target.value })}
                  placeholder="Authentic chef recipe cooked with fresh ingredients..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 text-xs font-extrabold hover:shadow-lg transition cursor-pointer active:scale-98"
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

