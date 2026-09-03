// @ts-ignore - pdf-parse doesn't have proper TypeScript definitions
import PDFParser from 'pdf-parse/lib/pdf.js';
import { readFile } from 'fs/promises';

/**
 * Extract text content from PDF file or buffer
 */
export async function extractPdfText(filePathOrBuffer: string | Buffer): Promise<string> {
  try {
    let fileBuffer: Buffer;

    // Handle both file path and buffer input
    if (typeof filePathOrBuffer === 'string') {
      fileBuffer = await readFile(filePathOrBuffer);
    } else {
      fileBuffer = filePathOrBuffer;
    }

    const pdfData = await PDFParser(fileBuffer, {});

    // Combine text from all pages
    let fullText = '';

    if (pdfData.text) {
      fullText = pdfData.text;
    } else if (pdfData.version && pdfData.pages) {
      // Fallback: extract text from individual pages
      for (const page of pdfData.pages) {
        if (typeof page === 'object' && 'text' in page) {
          fullText += (page as any).text + '\n';
        }
      }
    }

    if (!fullText) {
      throw new Error('No text content found in PDF');
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}

/**
 * Extract metadata from PDF (if available)
 */
export async function extractPdfMetadata(filePath: string) {
  try {
    const fileBuffer = await readFile(filePath);
    const pdfData = await PDFParser(fileBuffer);

    return {
      pages: pdfData.numpages || pdfData.version,
      title: (pdfData.info as any)?.Title || null,
      author: (pdfData.info as any)?.Author || null,
      subject: (pdfData.info as any)?.Subject || null,
      createdDate: (pdfData.info as any)?.CreationDate || null,
    };
  } catch (error) {
    console.error('Error extracting PDF metadata:', error);
    return null;
  }
}

/**
 * Validate if file is a valid PDF
 */
export async function validatePdf(filePath: string): Promise<boolean> {
  try {
    const fileBuffer = await readFile(filePath);
    // Check PDF magic number
    const pdfMagic = fileBuffer.toString('ascii', 0, 4);
    return pdfMagic === '%PDF';
  } catch (error) {
    console.error('Error validating PDF:', error);
    return false;
  }
}
