import { v2 as cloudinary } from 'cloudinary';
import { getPublicIdFromUrl } from '../cloudinaryUtils';

// Configure usage in a singleton-like module or init here
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

export class CloudinaryService {
  /**
   * Deletes an image by its public ID.
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    if (!publicId) return false;
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`[CloudinaryService] Deleted ${publicId}:`, result);
      return result.result === 'ok';
    } catch (error) {
      console.error('[CloudinaryService] Deletion failed:', error);
      return false;
    }
  }

  /**
   * Deletes an image by its full URL (convenience method).
   */
  static async deleteImageByUrl(url: string): Promise<boolean> {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;
    return this.deleteImage(publicId);
  }
}
