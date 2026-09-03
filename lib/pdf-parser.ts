/**
 * Validate if buffer is a valid PDF
 */
export function validatePdfBuffer(buffer: Buffer): boolean {
  try {
    // Check PDF magic number
    const pdfMagic = buffer.toString('ascii', 0, 4);
    return pdfMagic === '%PDF';
  } catch (error) {
    console.error('Error validating PDF:', error);
    return false;
  }
}

/**
 * Convert PDF buffer to base64 for storage
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Convert base64 back to buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

/**
 * Get file size in MB
 */
export function getFileSizeInMB(buffer: Buffer): number {
  return buffer.length / (1024 * 1024);
}
