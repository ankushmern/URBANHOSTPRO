import { Request, Response } from 'express';
import { Dish } from '../models/Dish';
import { cursorPaginate } from '../utils/cursorPagination';

/**
 * @desc    Fetch all dishes with Search, Filter, Sort & Cursor/Offset Pagination
 * @route   GET /api/v1/dishes
 * @access  Public
 */
export const getAllDishes = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      isVeg,
      minPrice,
      maxPrice,
      sortBy = 'rating',
      cursor,
      page = 1,
      limit = 10,
    } = req.query;

    const queryFilter: any = { isDeleted: false };

    if (category && category !== 'All') {
      queryFilter.category = category;
    }

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    if (isVeg !== undefined) {
      queryFilter.isVeg = isVeg === 'true';
    }

    if (minPrice || maxPrice) {
      queryFilter.price = {};
      if (minPrice) queryFilter.price.$gte = Number(minPrice);
      if (maxPrice) queryFilter.price.$lte = Number(maxPrice);
    }

    // Cursor pagination path
    if (cursor) {
      const paginated = await cursorPaginate(Dish, {
        query: queryFilter,
        limit: Number(limit) || 10,
        cursor: String(cursor),
        sortField: sortBy === 'price-asc' || sortBy === 'price-desc' ? 'price' : 'rating',
        sortOrder: sortBy === 'price-asc' ? 'asc' : 'desc',
      });

      res.json({
        success: true,
        dishes: paginated.data,
        nextCursor: paginated.nextCursor,
        hasMore: paginated.hasMore,
      });
      return;
    }

    // Sort order
    let sortOptions: any = {};
    if (sortBy === 'price-asc') sortOptions = { price: 1 };
    else if (sortBy === 'price-desc') sortOptions = { price: -1 };
    else if (sortBy === 'rating') sortOptions = { rating: -1 };
    else sortOptions = { createdAt: -1 };

    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNumber - 1) * pageSize;

    const dishes = await Dish.find(queryFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalCount = await Dish.countDocuments(queryFilter);

    res.json({
      success: true,
      pagination: {
        totalItems: totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
        pageSize,
      },
      dishes,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dishes.', error: error.message });
  }
};

/**
 * @desc    Get dish by ID
 * @route   GET /api/v1/dishes/:id
 * @access  Public
 */
export const getDishById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dish = await Dish.findOne({ isDeleted: false, $or: [{ _id: id }, { dishId: id }] }).lean();

    if (!dish) {
      res.status(404).json({ success: false, message: 'Dish not found.' });
      return;
    }

    res.json({ success: true, dish });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving dish.', error: error.message });
  }
};

/**
 * @desc    Create new dish
 * @route   POST /api/v1/dishes
 * @access  Private / Admin
 */
export const createDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, price, originalPrice, description, image, ingredients, prepTime, isVeg, isPopular } = req.body;

    if (!title || price === undefined) {
      res.status(400).json({ success: false, message: 'Dish title and price are required.' });
      return;
    }

    const dishId = `dish_${Date.now()}`;

    const newDish = await Dish.create({
      dishId,
      title,
      category: category || 'Popular',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) + 50,
      description: description || 'Delicious handcrafted home-style dish.',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      ingredients: ingredients || [],
      prepTime: prepTime || '30 mins',
      isVeg: isVeg !== undefined ? isVeg : true,
      isPopular: isPopular !== undefined ? isPopular : false,
      isDeleted: false,
    });

    res.status(201).json({ success: true, message: 'Dish created successfully.', dish: newDish });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create dish.', error: error.message });
  }
};

/**
 * @desc    Update dish
 * @route   PUT /api/v1/dishes/:id
 * @access  Private / Admin
 */
export const updateDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dish = await Dish.findOneAndUpdate(
      { isDeleted: false, $or: [{ _id: id }, { dishId: id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!dish) {
      res.status(404).json({ success: false, message: 'Dish not found for update.' });
      return;
    }

    res.json({ success: true, message: 'Dish updated successfully.', dish });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update dish.', error: error.message });
  }
};

/**
 * @desc    Soft Delete dish
 * @route   DELETE /api/v1/dishes/:id
 * @access  Private / Admin
 */
export const deleteDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dish = await Dish.findOne({ isDeleted: false, $or: [{ _id: id }, { dishId: id }] });

    if (!dish) {
      res.status(404).json({ success: false, message: 'Dish not found for deletion.' });
      return;
    }

    await dish.softDelete();

    res.json({ success: true, message: 'Dish deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete dish.', error: error.message });
  }
};
