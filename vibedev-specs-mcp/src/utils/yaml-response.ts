// YAML Response Utility Module - Provides standardized YAML response generation for MCP tools

import * as yaml from 'js-yaml';

// Content types for different response formats
export enum ContentType {
  SPEC_LIST = 'spec_list',
  SPEC_DETAIL = 'spec_detail', 
  STATUS_UPDATE = 'status_update',
  ARCHIVE_ACTION = 'archive_action',
  ERROR = 'error'
}

// Standard VibeSpec response interface
export interface VibeSpecResponse {
  vibespec_format: 'v1';           // Version identifier for detection
  type: ContentType;               // Content type for formatting selection
  data: any;                       // Actual structured data
  metadata?: {                     // Optional metadata
    timestamp?: string;
    session_id?: string;
    [key: string]: any;
  };
}

// Error data structure
export interface ErrorData {
  message: string;
  code: string;
  suggestion: string;
  context?: any;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validation error class
export class ValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Creates a standardized VibeSpec response
 */
export function createVibeSpecResponse(
  type: ContentType,
  data: any,
  metadata?: VibeSpecResponse['metadata']
): VibeSpecResponse {
  const response: VibeSpecResponse = {
    vibespec_format: 'v1',
    type,
    data
  };

  if (metadata) {
    response.metadata = metadata;
  }

  const validation = validateResponse(response);
  if (!validation.isValid) {
    throw new ValidationError('Invalid VibeSpec response', validation.errors);
  }

  return response;
}

/**
 * Creates a success response with optional metadata
 */
export function createSuccessResponse(
  type: ContentType,
  data: any,
  sessionId?: string
): string {
  const metadata = addMetadata({ session_id: sessionId });
  const response = createVibeSpecResponse(type, data, metadata);
  return yaml.dump(response, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  suggestion: string,
  context?: any,
  sessionId?: string
): string {
  const errorData: ErrorData = {
    message,
    code,
    suggestion
  };

  if (context) {
    errorData.context = context;
  }

  const metadata = addMetadata({ session_id: sessionId });
  const response = createVibeSpecResponse(ContentType.ERROR, errorData, metadata);
  
  return yaml.dump(response, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
}

/**
 * Validates a VibeSpec response structure
 */
export function validateResponse(response: any): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!response || typeof response !== 'object') {
    errors.push('Response must be an object');
    return { isValid: false, errors };
  }

  if (response.vibespec_format !== 'v1') {
    errors.push('vibespec_format must be "v1"');
  }

  if (!response.type || typeof response.type !== 'string') {
    errors.push('type field is required and must be a string');
  } else if (!Object.values(ContentType).includes(response.type as ContentType)) {
    errors.push(`type must be one of: ${Object.values(ContentType).join(', ')}`);
  }

  if (response.data === undefined || response.data === null) {
    errors.push('data field is required');
  }

  // Validate metadata if present
  if (response.metadata !== undefined) {
    if (typeof response.metadata !== 'object' || response.metadata === null) {
      errors.push('metadata must be an object if present');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Adds common metadata fields
 */
export function addMetadata(additionalMetadata?: Record<string, any>): VibeSpecResponse['metadata'] {
  const metadata: VibeSpecResponse['metadata'] = {
    timestamp: new Date().toISOString()
  };

  if (additionalMetadata) {
    Object.assign(metadata, additionalMetadata);
  }

  return metadata;
}

/**
 * Checks if an object is a valid VibeSpec response
 */
export function isVibeSpecResponse(obj: any): obj is VibeSpecResponse {
  const validation = validateResponse(obj);
  return validation.isValid;
}

/**
 * Parses YAML string and validates it as VibeSpec response
 */
export function parseVibeSpecResponse(yamlString: string): VibeSpecResponse | null {
  try {
    const parsed = yaml.load(yamlString);
    if (isVibeSpecResponse(parsed)) {
      return parsed;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Serializes a VibeSpec response to YAML string
 */
export function serializeResponse(response: VibeSpecResponse): string {
  const validation = validateResponse(response);
  if (!validation.isValid) {
    throw new ValidationError('Cannot serialize invalid response', validation.errors);
  }

  return yaml.dump(response, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });
}