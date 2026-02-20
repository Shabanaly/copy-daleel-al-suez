/**
 * Place Utility Functions
 * 
 * Helper functions for working with places
 */

import { Place } from '@/domain/entities/place';

/**
 * Check if a place is currently open
 */
export function isPlaceOpen(place: Place): boolean {
    if (!place.opensAt || !place.closesAt) {
        return false; // No hours information
    }

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes;

    // Parse opensAt and closesAt (assuming format like "09:00" or "9:00 AM")
    const openTime = parseTimeString(place.opensAt);
    const closeTime = parseTimeString(place.closesAt);

    if (openTime === null || closeTime === null) {
        return false;
    }

    // Handle cases where closing time is past midnight
    if (closeTime < openTime) {
        // Place is open past midnight
        return currentTime >= openTime || currentTime < closeTime;
    }

    return currentTime >= openTime && currentTime < closeTime;
}

/**
 * Get the closing time for display
 */
export function getClosingTime(place: Place): string | null {
    if (!place.closesAt) return null;
    return place.closesAt;
}

/**
 * Get next opening time message
 */
export function getNextOpenTime(place: Place): string | null {
    if (!place.opensAt) return null;

    const isOpen = isPlaceOpen(place);

    if (isOpen) {
        return getClosingTime(place);
    }

    // If closed, return opening time
    return place.opensAt;
}

/**
 * Parse time string to minutes from midnight
 * Supports formats: "09:00", "9:00 AM", "21:00", "9:00 PM"
 */
function parseTimeString(timeStr: string): number | null {
    try {
        // Remove extra spaces
        const cleaned = timeStr.trim();

        // Check for AM/PM format
        const isPM = /pm/i.test(cleaned);
        const isAM = /am/i.test(cleaned);

        // Extract numbers
        const match = cleaned.match(/(\d{1,2}):?(\d{2})?/);
        if (!match) return null;

        let hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;

        // Convert 12-hour to 24-hour
        if (isAM && hours === 12) {
            hours = 0;
        } else if (isPM && hours !== 12) {
            hours += 12;
        }

        return hours * 60 + minutes;
    } catch {
        return null;
    }
}

/**
 * Format time for display
 */
export function formatTime(timeStr: string | null): string {
    if (!timeStr) return '';
    return timeStr;
}

/**
 * Get status badge text
 */
export function getStatusText(place: Place): { text: string; isOpen: boolean } {
    const isOpen = isPlaceOpen(place);

    if (isOpen) {
        const closeTime = getClosingTime(place);
        return {
            text: closeTime ? `مفتوح • يغلق ${closeTime}` : 'مفتوح الآن',
            isOpen: true,
        };
    }

    const openTime = place.opensAt;
    return {
        text: openTime ? `مغلق • يفتح ${openTime}` : 'مغلق',
        isOpen: false,
    };
}
