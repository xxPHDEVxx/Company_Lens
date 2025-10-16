"""
DateTime utility functions for proper timezone handling.
Ensures all datetime values are properly converted to UTC for API responses.
"""

import pytz
from django.utils import timezone
from rest_framework import serializers


class UTCDateTimeField(serializers.DateTimeField):
    """
    Custom DateTime field that always returns UTC timestamps.
    This ensures consistency regardless of Django's TIME_ZONE setting.

    Usage in serializers:
        last_update = UTCDateTimeField(read_only=True)
    """

    def to_representation(self, value):
        """Convert datetime to UTC and format as ISO string with Z suffix."""
        if value is None:
            return None

        # Convert to UTC if the datetime is timezone-aware
        if timezone.is_aware(value):
            value = value.astimezone(pytz.UTC)
        else:
            # Make naive datetime aware in UTC
            value = pytz.UTC.localize(value)

        # Format as ISO string with Z suffix (indicating UTC)
        return value.strftime('%Y-%m-%dT%H:%M:%S.%fZ')


def format_datetime_utc(dt):
    """
    Format a datetime object to UTC ISO format string.

    Args:
        dt (datetime): The datetime object to format

    Returns:
        str: ISO formatted string in UTC with Z suffix
    """
    if dt is None:
        return None

    if timezone.is_aware(dt):
        dt_utc = dt.astimezone(pytz.UTC)
    else:
        dt_utc = pytz.UTC.localize(dt)

    return dt_utc.strftime('%Y-%m-%dT%H:%M:%S.%fZ')


def ensure_utc(dt):
    """
    Ensure a datetime is in UTC timezone.

    Args:
        dt (datetime): The datetime to convert

    Returns:
        datetime: The datetime in UTC timezone
    """
    if dt is None:
        return None

    if timezone.is_aware(dt):
        return dt.astimezone(pytz.UTC)
    else:
        # Assume naive datetimes are in Django's default timezone
        default_tz = timezone.get_default_timezone()
        aware_dt = default_tz.localize(dt)
        return aware_dt.astimezone(pytz.UTC)