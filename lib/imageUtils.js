/**
 * Client-side image compression utility.
 * Resizes images to a max dimension and compresses via Canvas API
 * to keep Vercel Blob storage and bandwidth low.
 */

const MAX_DIMENSION = 1600; // px — longest side
const JPEG_QUALITY = 0.80; // 0–1 scale — good balance of quality vs size
const TARGET_MAX_BYTES = 500 * 1024; // 500KB target after compression

/**
 * Compress and resize an image file using Canvas API.
 * - Resizes so the longest side is ≤ MAX_DIMENSION
 * - Converts to JPEG at JPEG_QUALITY
 * - Returns a new File object
 *
 * @param {File} file - The original image file
 * @returns {Promise<File>} - The compressed image file
 */
export async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions (maintain aspect ratio)
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with quality compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Build a clean filename
          const ext = 'jpg';
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const compressedFile = new File(
            [blob],
            `${baseName}.${ext}`,
            { type: 'image/jpeg' }
          );

          resolve(compressedFile);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

/**
 * Get a human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
