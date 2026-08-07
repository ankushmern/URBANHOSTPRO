import { User } from '../models/User.js';
import { Dish } from '../models/Dish.js';

export const seedInitialDatabase = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments().catch(() => -1);
    if (userCount === 0) {
      await User.create({
        name: 'CookMantra Admin',
        phone: '9876543210',
        email: 'admin@cookmantra.com',
        password: 'adminpassword123',
        role: 'admin',
        location: 'Mumbai, Maharashtra',
      });
      console.log('🌱 Admin user account seeded.');
    }

    const dishCount = await Dish.countDocuments().catch(() => -1);
    if (dishCount === 0) {
      await Dish.create([
        {
          dishId: 'dish_1',
          title: 'Paneer Butter Masala',
          category: 'North Indian',
          price: 249,
          originalPrice: 299,
          rating: 4.9,
          reviewsCount: 340,
          prepTime: '25 mins',
          serves: '2-3 Persons',
          description: 'Rich, creamy cottage cheese cubes cooked in a velvety tomato, butter & cashew gravy.',
          ingredients: ['Fresh Paneer', 'Butter', 'Cream', 'Cashew Paste', 'Spices'],
          image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop',
          isVeg: true,
          isPopular: true,
        },
        {
          dishId: 'dish_2',
          title: 'Hyderabadi Dum Biryani',
          category: 'Popular',
          price: 329,
          originalPrice: 389,
          rating: 4.95,
          reviewsCount: 520,
          prepTime: '40 mins',
          serves: '2 Persons',
          description: 'Fragrant basmati rice slow-cooked with aromatic spices, caramelized onions, and saffron.',
          ingredients: ['Basmati Rice', 'Saffron', 'Ghee', 'Whole Spices', 'Mint'],
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
          isVeg: true,
          isPopular: true,
        },
        {
          dishId: 'dish_3',
          title: 'CookMantra ₹9 Special Trial Dish',
          category: 'Trial',
          price: 9,
          originalPrice: 99,
          rating: 5.0,
          reviewsCount: 1250,
          prepTime: '15 mins',
          serves: '1 Person',
          description: 'Special trial tasting dish crafted by expert home chefs for first-time customers.',
          ingredients: ['Chef Selection', 'Fresh Herbs', 'Special Sauce'],
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
          isVeg: true,
          isPopular: true,
        },
      ]);
      console.log('🌱 Sample dishes seeded.');
    }
  } catch (error) {
    // Non-critical, ignore
  }
};
