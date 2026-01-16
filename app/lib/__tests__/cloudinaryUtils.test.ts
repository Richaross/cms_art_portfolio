import { getPublicIdFromUrl } from '../cloudinaryUtils';

describe('cloudinaryUtils', () => {
  describe('getPublicIdFromUrl', () => {
    it('should extract public ID from a simple URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      expect(getPublicIdFromUrl(url)).toBe('sample');
    });

    it('should extract public ID with background folder', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/folder/sample.jpg';
      expect(getPublicIdFromUrl(url)).toBe('folder/sample');
    });

    it('should handle version in URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg';
      expect(getPublicIdFromUrl(url)).toBe('sample');
    });

    it('should handle version and folder in URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v12345678/folder/sample.jpg';
      expect(getPublicIdFromUrl(url)).toBe('folder/sample');
    });

    it('should return null for invalid URL', () => {
      expect(getPublicIdFromUrl('invalid-url')).toBeNull();
    });

    it('should return null for empty URL', () => {
      expect(getPublicIdFromUrl('')).toBeNull();
    });
  });
});
