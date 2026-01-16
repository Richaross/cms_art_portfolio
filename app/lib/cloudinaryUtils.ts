/**
 * Extracts the public ID from a Cloudinary URL.
 * Pattern: .../upload/v{version}/{folder}/{id}.{ext}
 */
export function getPublicIdFromUrl(url: string): string | null {
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
