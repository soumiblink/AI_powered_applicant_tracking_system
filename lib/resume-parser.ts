import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts text from a PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF appears to be empty or contains only images');
    }
    
    return data.text.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to extract text from PDF: ${error.message}`
        : 'Failed to extract text from PDF'
    );
  }
}

/**
 * Extracts text from a DOCX buffer
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX appears to be empty');
    }
    
    // Log any warnings from mammoth
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }
    
    return result.value.trim();
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to extract text from DOCX: ${error.message}`
        : 'Failed to extract text from DOCX'
    );
  }
}

/**
 * Extracts text from a File object
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(buffer);
    } else {
      throw new Error(
        `Unsupported file type: ${fileType || 'unknown'}. Please upload PDF or DOCX files.`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract text from file');
  }
}

/**
 * Extracts text from a file URL (for processing already uploaded files)
 */
export async function extractTextFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Determine file type from URL or content-type
    const contentType = response.headers.get('content-type') || '';
    const urlLower = url.toLowerCase();

    if (contentType.includes('pdf') || urlLower.endsWith('.pdf')) {
      return await extractTextFromPDF(buffer);
    } else if (
      contentType.includes('wordprocessingml') ||
      urlLower.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(buffer);
    } else {
      throw new Error('Unable to determine file type from URL');
    }
  } catch (error) {
    console.error('URL parsing error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to extract text from URL: ${error.message}`
        : 'Failed to extract text from URL'
    );
  }
}

/**
 * Validates if extracted text has meaningful content
 */
export function validateExtractedText(text: string): {
  valid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      error: 'No text could be extracted from the file',
    };
  }

  // Check for minimum content length (at least 50 characters)
  if (text.trim().length < 50) {
    return {
      valid: false,
      error: 'Extracted text is too short. Please ensure the resume has readable content.',
    };
  }

  return { valid: true };
}

/**
 * Cleans and normalizes extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
