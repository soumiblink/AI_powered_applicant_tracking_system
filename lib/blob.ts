import { put, del, PutBlobResult } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is not defined in environment variables');
}

export interface UploadOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  folder?: string;
}

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Validates file before upload
 */
export function validateFile(
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } {
  const maxSizeInMB = options.maxSizeInMB || DEFAULT_MAX_SIZE_MB;
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeInMB}MB`,
    };
  }

  // Check file type
  const isValidType =
    allowedTypes.includes(file.type) ||
    (file.name.endsWith('.docx') &&
      allowedTypes.includes(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ));

  if (!isValidType) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PDF or DOCX files only.',
    };
  }

  return { valid: true };
}

/**
 * Uploads a file to Vercel Blob Storage
 */
export async function uploadToBlob(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    
    // Add folder prefix if specified
    const pathname = options.folder ? `${options.folder}/${filename}` : filename;

    // Upload to Vercel Blob
    const blob: PutBlobResult = await put(pathname, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload file to storage'
    );
  }
}

/**
 * Deletes a file from Vercel Blob Storage
 */
export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Blob delete error:', error);
    throw new Error('Failed to delete file from storage');
  }
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
