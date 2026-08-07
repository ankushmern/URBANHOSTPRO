import express from 'express';
import { getAllDishes, getDishById, createDish, updateDish, deleteDish } from '../controllers/dishController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createDishSchema, updateDishSchema } from '../validators/dishValidator.js';

const router = express.Router();

router.route('/')
  .get(getAllDishes)
  .post(protect, adminOnly, validateRequest(createDishSchema), createDish);

router.route('/:id')
  .get(getDishById)
  .put(protect, adminOnly, validateRequest(updateDishSchema), updateDish)
  .delete(protect, adminOnly, deleteDish);

export default router;
