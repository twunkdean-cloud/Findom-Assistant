/**
 * Input validation utilities for AI features and user inputs
 * Helps prevent prompt injection, XSS, and excessive API usage
 */

// Constants for validation
export const MAX_PROMPT_LENGTH = 10000;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_CONVERSATION_HISTORY_LENGTH = 50000;

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Allowed file extensions for conversation history
export const ALLOWED_CONVERSATION_FILE_TYPES = ['.json', '.txt'];

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Validate prompt length and content
 */
export const validatePrompt = (prompt: string): ValidationResult => {
  if (!prompt || typeof prompt !== 'string') {
    return {
      isValid: false,
      error: 'Prompt is required and must be a string',
    };
  }

  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Prompt cannot be empty',
    };
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
    };
  }

  // Check for potential prompt injection patterns
  const suspiciousPatterns = [
    /ignore\s+(previous|all|above)\s+instructions?/i,
    /disregard\s+(previous|all|above)\s+instructions?/i,
    /new\s+instructions?:/i,
    /system\s*:\s*ignore/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Prompt contains potentially unsafe content',
      };
    }
  }

  return {
    isValid: true,
    sanitizedValue: trimmed,
  };
};

/**
 * Validate image data format and size
 */
export const validateImageData = (imageData: string): ValidationResult => {
  if (!imageData || typeof imageData !== 'string') {
    return {
      isValid: false,
      error: 'Image data is required and must be a string',
    };
  }

  // Check data URI format
  const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return {
      isValid: false,
      error: 'Invalid image format. Must be a base64-encoded data URI',
    };
  }

  const [, mimeType, base64Data] = matches;

  // Validate MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return {
      isValid: false,
      error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Estimate size (base64 is ~1.37x original size)
  const estimatedSizeBytes = (base64Data.length * 3) / 4;
  if (estimatedSizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Image size exceeds maximum of ${MAX_IMAGE_SIZE_MB}MB`,
    };
  }

  return {
    isValid: true,
    sanitizedValue: imageData,
  };
};

/**
 * Validate conversation history
 */
export const validateConversationHistory = (history: string): ValidationResult => {
  if (!history || typeof history !== 'string') {
    return {
      isValid: false,
      error: 'Conversation history must be a string',
    };
  }

  if (history.length > MAX_CONVERSATION_HISTORY_LENGTH) {
    return {
      isValid: false,
      error: `Conversation history exceeds maximum length of ${MAX_CONVERSATION_HISTORY_LENGTH} characters`,
    };
  }

  return {
    isValid: true,
    sanitizedValue: history.trim(),
  };
};

/**
 * Validate file type for uploads
 */
export const validateFileType = (
  filename: string,
  allowedExtensions: string[]
): ValidationResult => {
  if (!filename || typeof filename !== 'string') {
    return {
      isValid: false,
      error: 'Filename is required',
    };
  }

  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSizeBytes: number
): ValidationResult => {
  if (!file || !(file instanceof File)) {
    return {
      isValid: false,
      error: 'Invalid file',
    };
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds maximum of ${maxSizeMB}MB`,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Sanitize HTML to prevent XSS
 * This is a basic sanitization. For production, consider using a library like DOMPurify
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';

  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Validate and sanitize JSON input
 */
export const validateJsonInput = (jsonString: string): ValidationResult => {
  if (!jsonString || typeof jsonString !== 'string') {
    return {
      isValid: false,
      error: 'JSON input is required',
    };
  }

  try {
    JSON.parse(jsonString);
    return {
      isValid: true,
      sanitizedValue: jsonString.trim(),
    };
  } catch {
    return {
      isValid: false,
      error: 'Invalid JSON format',
    };
  }
};
