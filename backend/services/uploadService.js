import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';

/**
 * Check if Cloudinary is fully configured.
 */
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'mock_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'mock_api_secret'
  );
};

/**
 * Upload an image to Cloudinary (if configured) or save locally to the 'uploads' directory.
 * @param {Object} file - Multer file object (memory storage buffer)
 * @param {string} folder - Destination subfolder (e.g. 'profiles', 'recipes')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'general') => {
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `recipeai/${folder}`,
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Optimize image size
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ],
        },
        (error, result) => {
          if (error) {
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(file.buffer);
    });
  } else {
    // Local Fallback Storage
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'uploads', folder);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, file.buffer);

    // Return relative URL that the express static server can resolve
    return `/uploads/${folder}/${uniqueName}`;
  }
};

/**
 * Delete an image from Cloudinary or local disk.
 * @param {string} imageUrl - The full URL of the image to delete
 * @returns {Promise<boolean>} - True if deletion succeeded
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return false;

  try {
    if (imageUrl.startsWith('http://res.cloudinary.com') || imageUrl.startsWith('https://res.cloudinary.com')) {
      // Cloudinary Image Deletion
      // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567/recipeai/folder/filename.jpg
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
        // publicId would be e.g. "recipeai/profiles/filename" (omitting extension)
        const pathParts = urlParts.slice(uploadIndex + 2); // gets ["recipeai", "profiles", "filename.jpg"]
        const fullPath = pathParts.join('/'); // gets "recipeai/profiles/filename.jpg"
        const publicId = fullPath.substring(0, fullPath.lastIndexOf('.')); // strips ".jpg" -> "recipeai/profiles/filename"
        
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
      }
      return false;
    } else if (imageUrl.startsWith('/uploads/')) {
      // Local Disk Deletion
      // Local path: /uploads/folder/filename.jpg -> maps to process.cwd() + /uploads/folder/filename.jpg
      const relativePath = imageUrl.substring(1); // strips starting "/" -> "uploads/folder/filename.jpg"
      const absolutePath = path.join(process.cwd(), relativePath);
      
      await fs.unlink(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[UploadService Delete Error]: ${error.message}`);
    return false;
  }
};
