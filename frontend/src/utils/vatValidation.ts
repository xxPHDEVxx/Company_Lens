/**
 * Utility functions for Belgian VAT number handling.
 *
 * Belgian VAT format: BE + 10 digits (e.g., BE0123456789)
 */

export interface VatValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Normalize a Belgian VAT number to standard format (BE + 10 digits).
 *
 * Accepts various input formats:
 * - "BE0123456789"
 * - "0123456789"
 * - "BE 0123 456 789"
 * - "BE.0123.456.789"
 * - "123456789" (will be padded to 10 digits)
 *
 * @param vatInput - VAT number in any accepted format
 * @returns Normalized VAT in format "BE0123456789"
 * @throws Error if VAT cannot be normalized to valid format
 */
export const normalizeVat = (vatInput: string): string => {
  if (!vatInput) {
    throw new Error('Le numéro de TVA ne peut pas être vide');
  }

  // Step 1: Clean input - remove spaces, dots, dashes, convert to uppercase
  let vat = vatInput.toUpperCase().trim();
  vat = vat.replace(/[\s.\-]/g, '');

  // Step 2: Remove BE prefix temporarily to work with digits only
  let digits = vat.startsWith('BE') ? vat.substring(2) : vat;

  // Step 3: Ensure we only have digits
  if (!/^\d+$/.test(digits)) {
    throw new Error(
      'Format invalide. Le numéro de TVA doit contenir uniquement des chiffres après le préfixe BE'
    );
  }

  // Step 4: Check length and pad if needed
  if (digits.length > 10) {
    throw new Error(
      `Format invalide. Le numéro de TVA contient ${digits.length} chiffres, 10 attendus exactement`
    );
  }

  // Pad with leading zeros if less than 10 digits
  digits = digits.padStart(10, '0');

  // Step 5: Construct final format
  const normalized = `BE${digits}`;

  return normalized;
};

/**
 * Check if a VAT number is in valid Belgian format.
 *
 * Valid format: BE + exactly 10 digits
 *
 * @param vat - VAT number to validate
 * @returns True if valid, False otherwise
 */
export const validateVat = (vat: string): boolean => {
  const pattern = /^BE\d{10}$/;
  return pattern.test(vat);
};

/**
 * Validate and normalize a VAT number with detailed error messages.
 *
 * @param vatInput - VAT number to validate
 * @returns Validation result with normalized VAT if valid
 */
export const validateAndNormalizeVat = (vatInput: string): VatValidationResult => {
  if (!vatInput || !vatInput.trim()) {
    return {
      isValid: false,
      error: 'Veuillez entrer un numéro de TVA'
    };
  }

  try {
    const normalized = normalizeVat(vatInput);
    return {
      isValid: true,
      normalized
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Format de TVA invalide'
    };
  }
};

/**
 * Check if a string looks like a Belgian VAT number (even if not normalized).
 * More lenient than validateVat - useful for detecting VAT-like strings.
 *
 * @param value - String to check
 * @returns True if looks like a VAT number
 */
export const isVatFormat = (value: string): boolean => {
  if (!value) return false;

  // Remove common separators
  const cleaned = value.toUpperCase().replace(/[\s.\-]/g, '');

  // Check if it's BE + digits or just digits (9-10 digits)
  return /^BE\d{10}$/.test(cleaned) || /^\d{9,10}$/.test(cleaned);
};

/**
 * Format VAT for human-readable display.
 *
 * @param vat - VAT number in format "BE0123456789"
 * @param separator - Character to use as separator (default: space)
 * @returns Formatted VAT (e.g., "BE 0123 456 789")
 */
export const formatVatDisplay = (vat: string, separator: string = ' '): string => {
  if (!validateVat(vat)) {
    throw new Error(`Format de TVA invalide: ${vat}`);
  }

  const digits = vat.substring(2);
  // Group as: BE XXXX XXX XXX
  return `BE${separator}${digits.substring(0, 4)}${separator}${digits.substring(4, 7)}${separator}${digits.substring(7)}`;
};
