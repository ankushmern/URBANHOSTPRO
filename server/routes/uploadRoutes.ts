import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, uploadImage);

export default router;
