/**
 * Utility functions for transforming between snake_case and camelCase
 * Used to normalize API responses and requests
 */

/**
 * Convert a snake_case string to camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert a camelCase string to snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Recursively transform object keys from snake_case to camelCase
 */
export const transformKeysSnakeToCamel = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysSnakeToCamel);
  }

  if (typeof obj === 'object') {
    const transformed: any = {};
    
    Object.keys(obj).forEach(key => {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeysSnakeToCamel(obj[key]);
    });
    
    return transformed;
  }

  return obj;
};

/**
 * Recursively transform object keys from camelCase to snake_case
 */
export const transformKeysCamelToSnake = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysCamelToSnake);
  }

  if (typeof obj === 'object') {
    const transformed: any = {};
    
    Object.keys(obj).forEach(key => {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformKeysCamelToSnake(obj[key]);
    });
    
    return transformed;
  }

  return obj;
};

/**
 * Transform API response from snake_case to camelCase
 * Preserves special fields that should remain unchanged
 */
export const transformResponse = (data: any): any => {
  // Special fields that should not be transformed
  // These boolean flags are kept in snake_case by convention throughout the app
  const preservedFields = ['is_followed', 'is_active'];
  
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    // Preserve special fields
    const preserved: any = {};
    preservedFields.forEach(field => {
      if (field in data) {
        preserved[field] = data[field];
      }
    });
    
    // Transform the rest
    const transformed = transformKeysSnakeToCamel(data);
    
    // Restore preserved fields
    Object.assign(transformed, preserved);
    
    return transformed;
  }
  
  return transformKeysSnakeToCamel(data);
};

/**
 * Transform API request from camelCase to snake_case
 */
export const transformRequest = (data: any): any => {
  return transformKeysCamelToSnake(data);
};