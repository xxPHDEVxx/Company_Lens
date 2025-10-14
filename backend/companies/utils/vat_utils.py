"""
Utility functions for Belgian VAT number handling.

Belgian VAT format: BE + 10 digits (e.g., BE0123456789)
"""

import re
from typing import Optional


def normalize_vat(vat_input: str) -> str:
    """
    Normalize a Belgian VAT number to standard format (BE + 10 digits).

    Accepts various input formats:
    - "BE0123456789"
    - "0123456789"
    - "BE 0123 456 789"
    - "BE.0123.456.789"
    - "123456789" (will be padded to 10 digits)

    Args:
        vat_input: VAT number in any accepted format

    Returns:
        Normalized VAT in format "BE0123456789"

    Raises:
        ValueError: If VAT cannot be normalized to valid format

    Examples:
        >>> normalize_vat("BE0435187629")
        'BE0435187629'
        >>> normalize_vat("0435187629")
        'BE0435187629'
        >>> normalize_vat("BE 0435 187 629")
        'BE0435187629'
        >>> normalize_vat("435187629")
        'BE0435187629'
    """
    if not vat_input:
        raise ValueError("VAT number cannot be empty")

    # Step 1: Clean input - remove spaces, dots, dashes, convert to uppercase
    vat = vat_input.upper().strip()
    vat = re.sub(r'[\s.\-]', '', vat)

    # Step 2: Remove BE prefix temporarily to work with digits only
    if vat.startswith('BE'):
        digits = vat[2:]
    else:
        digits = vat

    # Step 3: Ensure we only have digits
    if not digits.isdigit():
        raise ValueError(
            f"Invalid VAT format: '{vat_input}'. "
            "VAT must contain only digits after BE prefix"
        )

    # Step 4: Pad to 10 digits if shorter
    if len(digits) > 10:
        raise ValueError(
            f"Invalid VAT format: '{vat_input}'. "
            f"VAT has {len(digits)} digits, expected exactly 10"
        )

    digits = digits.zfill(10)  # Pad with leading zeros

    # Step 5: Construct final format
    normalized = f"BE{digits}"

    return normalized


def validate_vat(vat: str) -> bool:
    """
    Check if a VAT number is in valid Belgian format.

    Valid format: BE + exactly 10 digits

    Args:
        vat: VAT number to validate

    Returns:
        True if valid, False otherwise

    Examples:
        >>> validate_vat("BE0435187629")
        True
        >>> validate_vat("BE123")
        False
        >>> validate_vat("FR0435187629")
        False
    """
    pattern = r'^BE\d{10}$'
    return bool(re.match(pattern, vat))


def extract_vat_digits(vat: str) -> str:
    """
    Extract only the 10 digits from a Belgian VAT number.

    Args:
        vat: VAT number in format "BE0123456789"

    Returns:
        Just the 10 digits

    Examples:
        >>> extract_vat_digits("BE0435187629")
        '0435187629'
    """
    if not validate_vat(vat):
        raise ValueError(f"Invalid VAT format: {vat}")
    return vat[2:]


def format_vat_display(vat: str, separator: str = ' ') -> str:
    """
    Format VAT for human-readable display.

    Args:
        vat: VAT number in format "BE0123456789"
        separator: Character to use as separator (default: space)

    Returns:
        Formatted VAT (e.g., "BE 0123 456 789")

    Examples:
        >>> format_vat_display("BE0435187629")
        'BE 0435 187 629'
        >>> format_vat_display("BE0435187629", separator='.')
        'BE.0435.187.629'
    """
    if not validate_vat(vat):
        raise ValueError(f"Invalid VAT format: {vat}")

    digits = vat[2:]
    # Group as: BE XXXX XXX XXX
    return f"BE{separator}{digits[:4]}{separator}{digits[4:7]}{separator}{digits[7:]}"


def is_vat_format(value: str) -> bool:
    """
    Check if a string looks like a Belgian VAT number (even if not normalized).

    More lenient than validate_vat - useful for detecting VAT-like strings.

    Args:
        value: String to check

    Returns:
        True if looks like a VAT number

    Examples:
        >>> is_vat_format("BE0435187629")
        True
        >>> is_vat_format("0435187629")
        True
        >>> is_vat_format("BE 0435 187 629")
        True
        >>> is_vat_format("12345")
        False
        >>> is_vat_format("ABC123")
        False
    """
    # Remove common separators
    cleaned = re.sub(r'[\s.\-]', '', value.upper())

    # Check if it's BE + digits or just digits (9-10 digits)
    return bool(
        re.match(r'^BE\d{10}$', cleaned) or  # Already normalized
        re.match(r'^\d{9,10}$', cleaned)      # Just digits
    )
