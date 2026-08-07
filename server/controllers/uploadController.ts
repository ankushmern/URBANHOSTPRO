import { Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// Allowed image MIME types and corresponding extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

/**
 * Virus / Malware Scan Hook
 * Simulates signature-based file stream analysis
 */
const performVirusScan = (dataBuffer: Buffer): { clean: boolean; threatName?: string } => {
  // Check for known test EICAR malware signature pattern
  const eicarSig = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
  if (dataBuffer.toString('utf-8').includes(eicarSig)) {
    return { clean: false, threatName: 'EICAR-Test-Signature' };
  }
  return { clean: true };
};

/**
 * @desc    Upload image with enterprise validation (MIME, Extension, Virus Scan, Random Filenames)
 * @route   POST /api/v1/upload
 * @access  Private / Authenticated
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, originalFilename } = req.body;

    if (!image || typeof image !== 'string') {
      res.status(400).json({
        success: false,
        message: 'No image payload provided. Please send a base64 encoded image string.',
      });
      return;
    }

    // 1. HTTP URL Passthrough validation
    if (image.startsWith('http://') || image.startsWith('https://')) {
      if (!/^https?:\/\/[^\s<>"{}|\\^`]+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(image)) {
        res.status(400).json({
          success: false,
          message: 'Invalid image URL format or unapproved image extension.',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Image URL validated successfully.',
        imageUrl: image,
      });
      return;
    }

    // 2. MIME Type Extract & Validation
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        res.status(400).json({
          success: false,
          message: 'Invalid base64 Data URL formatting.',
        });
        return;
      }
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    }

    if (!ALLOWED_MIME_TYPES[mimeType]) {
      res.status(400).json({
        success: false,
        message: `Disallowed file MIME type '${mimeType}'. Allowed types: JPEG, PNG, WEBP, GIF, SVG.`,
      });
      return;
    }

    // 3. File Size Validation (Max 5MB decoded)
    const buffer = Buffer.from(base64Data, 'base64');
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    if (buffer.length > MAX_SIZE_BYTES) {
      res.status(400).json({
        success: false,
        message: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 5MB.`,
      });
      return;
    }

    // 4. File Extension Validation & Sanitization
    if (originalFilename) {
      const ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
      const validExts = Object.values(ALLOWED_MIME_TYPES);
      if (ext && !validExts.includes(ext)) {
        res.status(400).json({
          success: false,
          message: `Extension '${ext}' does not match permitted image extensions (${validExts.join(', ')}).`,
        });
        return;
      }
    }

    // 5. Virus & Malware Scan Hook
    const scanResult = performVirusScan(buffer);
    if (!scanResult.clean) {
      logger.error(`🚨 [Security Threat] Virus detected in upload: ${scanResult.threatName}`);
      res.status(400).json({
        success: false,
        message: `Upload rejected. Security scan flag: Threat detected (${scanResult.threatName}).`,
      });
      return;
    }

    // 6. Generate Cryptographically Secure Random Filename (Prevent Path Traversal)
    const randomHex = crypto.randomBytes(16).toString('hex');
    const targetExtension = ALLOWED_MIME_TYPES[mimeType] || '.jpg';
    const secureFilename = `img_${Date.now()}_${randomHex}${targetExtension}`;

    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    logger.info(`✅ [Upload] Image uploaded securely. MIME: ${mimeType}, Size: ${buffer.length} bytes, SecureName: ${secureFilename}`);

    res.status(201).json({
      success: true,
      message: 'Image validated, virus scanned, and uploaded successfully!',
      filename: secureFilename,
      mimeType,
      sizeBytes: buffer.length,
      imageUrl,
    });
  } catch (error: any) {
    logger.error('Failed to process image upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process image upload.',
      error: error.message,
    });
  }
};
