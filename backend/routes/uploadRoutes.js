import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadImage } from '../services/uploadService.js';
import { ErrorResponse } from '../middlewares/errorMiddleware.js';

const router = express.Router();

/**
 * @desc    Upload an image
 * @route   POST /api/upload
 * @access  Private
 */
router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Determine subfolder destination folder based on request type (e.g. "profiles", "recipes")
    const folderType = req.body.type || 'general';
    const imageUrl = await uploadImage(req.file, folderType);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: imageUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
