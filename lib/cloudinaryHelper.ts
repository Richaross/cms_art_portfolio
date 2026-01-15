export function getPublicIdFromUrl(url: string): string | null {
  if (!url) return null;

  // Regex to capture the public ID from a standard Cloudinary URL
  // Matches patterns like: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/imageId.jpg
  // We want 'folder/imageId'

  // 1. Split by 'upload/' and take the second part
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;

  // 2. The second part is like 'v123456/art_uploads/pic.jpg' or just 'v123456/pic.jpg'
  // We want to ignore the version number (v123...) if it exists
  const pathParts = parts[1].split('/');

  // Remove the version part if it exists (starts with 'v' followed by numbers)
  // Cloudinary versions are optional in URLs but common
  if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
    pathParts.shift();
  }

  // Rejoin the remaining parts (folder + image)
  const publicIdWithExtension = pathParts.join('/');

  // Remove the file extension (.jpg, .png, etc)
  const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

  return publicId;
}
