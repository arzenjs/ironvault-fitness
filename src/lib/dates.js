/**
 * Calendar arithmetic used for membership validity.
 * All values are UTC instants; display formatting happens in lib/format.js.
 */

/**
 * Adds whole months to a date, clamping the day to the last valid day of the
 * target month. This is the behaviour a gym expects:
 *
 *   31 Jan + 1 month  -> 28 Feb (or 29 Feb in a leap year)
 *   31 Aug + 3 months -> 30 Nov
 *   15 Mar + 12 months -> 15 Mar next year
 *
 * (Plain `setMonth` would overflow 31 Jan into 3 March, silently giving members
 * extra days.)
 */
export function addMonthsClamped(date, months) {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) throw new Error("addMonthsClamped received an invalid date");

  const year = start.getUTCFullYear();
  const month = start.getUTCMonth();
  const day = start.getUTCDate();

  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalisedMonth = ((targetMonthIndex % 12) + 12) % 12;

  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, normalisedMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, lastDayOfTargetMonth);

  return new Date(
    Date.UTC(
      targetYear,
      normalisedMonth,
      clampedDay,
      start.getUTCHours(),
      start.getUTCMinutes(),
      start.getUTCSeconds(),
      start.getUTCMilliseconds(),
    ),
  );
}

/** Whole days between `to` and `from`, rounded up, never negative. */
export function daysBetween(from, to) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(diff)) return 0;
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/**
 * Where a new membership should begin.
 *
 * If the customer already holds time that has not finished (active or queued),
 * the new plan is queued to start the moment the latest paid period ends, so no
 * paid days are lost and no period is shortened.
 */
export function nextStartDate({ existingMemberships = [], now = new Date() } = {}) {
  const latestEnd = existingMemberships
    .filter((membership) => membership.endDate && new Date(membership.endDate).getTime() > now.getTime())
    .reduce((max, membership) => {
      const end = new Date(membership.endDate).getTime();
      return end > max ? end : max;
    }, 0);

  return latestEnd > now.getTime() ? new Date(latestEnd) : new Date(now);
}
