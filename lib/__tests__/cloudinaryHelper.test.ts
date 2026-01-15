import { getPublicIdFromUrl } from '../cloudinaryHelper';

describe('cloudinaryHelper', () => {
  describe('getPublicIdFromUrl', () => {
    it('extracts public ID from standard URL with version', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v123456/sample.jpg';
      expect(getPublicIdFromUrl(url)).toBe('sample');
    });

    it('extracts public ID from URL with folder and version', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/v987654/art-portfolio/painting1.png';
      expect(getPublicIdFromUrl(url)).toBe('art-portfolio/painting1');
    });

    it('extracts public ID from URL without version', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample_image.jpg';
      expect(getPublicIdFromUrl(url)).toBe('sample_image');
    });

    it('returns null for empty or invalid input', () => {
      expect(getPublicIdFromUrl('')).toBeNull();
      // @ts-expect-error Testing invalid input
      expect(getPublicIdFromUrl(null)).toBeNull();
    });

    it('handles URLs with multiple underscores or special chars', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1/folder/my_image_name_1.jpg';
      expect(getPublicIdFromUrl(url)).toBe('folder/my_image_name_1');
    });
  });
});
