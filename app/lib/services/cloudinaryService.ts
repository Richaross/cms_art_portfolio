import { v2 as cloudinary } from 'cloudinary';

// Configure usage in a singleton-like module or init here
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_PUBLIC_API,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

export class CloudinaryService {
  /**
   * Extracts the public ID from a Cloudinary URL.
   * Pattern: .../upload/v{version}/{folder}/{id}.{ext}
   */
  static getPublicIdFromUrl(url: string): string | null {
    if (!url) return null;
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;

      const pathParts = parts[1].split('/');
      // Remove version if present (starts with 'v' and number)
      if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
        pathParts.shift();
      }

      // Rejoin folder + filename, remove extension
      const publicIdWithExt = pathParts.join('/');
      return publicIdWithExt.replace(/\.[^/.]+$/, '');
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

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
    const publicId = this.getPublicIdFromUrl(url);
    if (!publicId) return false;
    return this.deleteImage(publicId);
  }
}
