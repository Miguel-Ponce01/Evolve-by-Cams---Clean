/**
 * business-hours.ts
 *
 * Single source of truth for Evolve Studio operating hours and Tuesday lockout rules.
 * All checks are performed relative to the Asia/Manila (UTC+8) timezone.
 */

export const START_HOUR_MANILA = 9; // 9:00 AM
export const END_HOUR_MANILA = 18; // 6:00 PM

/**
 * Converts any Date object to a Date representing the time in the Asia/Manila timezone.
 */
export function getManilaDate(date: Date): {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  hours: number;
  minutes: number;
  seconds: number;
} {
  // Use Intl.DateTimeFormat to force formatting in Asia/Manila timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const findPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);

  const year = findPart('year');
  const month = findPart('month');
  const day = findPart('day');
  const hours = findPart('hour');
  const minutes = findPart('minute');
  const seconds = findPart('second');

  // To calculate day of week in Manila timezone, construct a Date using parts
  // Note: Month index is 0-indexed in Date constructor
  const manilaLoc = new Date(year, month - 1, day, hours, minutes, seconds);
  const dayOfWeek = manilaLoc.getDay();

  return {
    year,
    month,
    day,
    dayOfWeek,
    hours,
    minutes,
    seconds,
  };
}

/**
 * Validates whether a proposed date and duration violates Evolve Studio business rules:
 * 1. Tuesday Lockout: The studio is closed all day every Tuesday.
 * 2. Operating Hours: No session may start before 9:00 AM or end after 6:00 PM (Manila Time).
 */
export function validateSessionTime(
  startTime: Date,
  durationMinutes: number
): { isValid: boolean; reason?: string } {
  const startManila = getManilaDate(startTime);

  // 1. Tuesday lockout rule (Day 2 of week is Tuesday)
  if (startManila.dayOfWeek === 2) {
    return {
      isValid: false,
      reason: 'The studio is closed all day on Tuesdays.',
    };
  }

  // 2. Start hour check
  if (startManila.hours < START_HOUR_MANILA || (startManila.hours === START_HOUR_MANILA && startManila.minutes < 0)) {
    return {
      isValid: false,
      reason: `Sessions cannot start before ${START_HOUR_MANILA}:00 AM Manila time.`,
    };
  }

  // 3. End hour check
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  const endManila = getManilaDate(endTime);

  // Check if session ends on Tuesday (runs overnight past midnight Monday)
  if (endManila.dayOfWeek === 2) {
    return {
      isValid: false,
      reason: 'Session overlaps into Tuesday operating lockout.',
    };
  }

  if (endManila.hours > END_HOUR_MANILA || (endManila.hours === END_HOUR_MANILA && (endManila.minutes > 0 || endManila.seconds > 0))) {
    return {
      isValid: false,
      reason: `Sessions cannot end after ${END_HOUR_MANILA - 12}:00 PM Manila time.`,
    };
  }

  // Also verify it doesn't span across multiple days
  if (startManila.day !== endManila.day || startManila.month !== endManila.month || startManila.year !== endManila.year) {
    return {
      isValid: false,
      reason: 'Sessions cannot span across calendar days.',
    };
  }

  return { isValid: true };
}

/**
 * Validates if a proposed day (0-6) is Tuesday (2).
 */
export function isTuesdayManila(date: Date): boolean {
  return getManilaDate(date).dayOfWeek === 2;
}
