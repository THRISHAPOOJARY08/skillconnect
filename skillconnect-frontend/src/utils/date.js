/**
 * Safely parse a LocalDateTime string from the Spring backend.
 * The backend sends timestamps WITHOUT a timezone suffix (e.g. "2024-10-04T05:30:00")
 * which the browser interprets as LOCAL time, not UTC — causing a shift equal to
 * the user's UTC offset (e.g. +5:30 in IST).
 *
 * Fix: append "Z" so the browser treats it as UTC, then display in local time.
 */

/**
 * @param {string|null|undefined} raw  - ISO datetime string from backend
 * @returns {Date|null}
 */
export function parseBackendDate(raw) {
  if (!raw) return null
  // If already has timezone info (Z or +HH:MM), parse as-is
  if (/[Zz]$/.test(raw) || /[+-]\d{2}:\d{2}$/.test(raw)) return new Date(raw)
  // No timezone — backend is UTC, append Z
  return new Date(raw + 'Z')
}

/**
 * Format a backend datetime string into human-readable local time.
 * @param {string|null|undefined} raw
 * @param {Intl.DateTimeFormatOptions} [opts]
 * @returns {string}
 */
export function formatDate(raw, opts) {
  const d = parseBackendDate(raw)
  if (!d || isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, opts ?? {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  })
}

/**
 * Format as date only (no time).
 * @param {string|null|undefined} raw
 * @returns {string}
 */
export function formatDateOnly(raw) {
  const d = parseBackendDate(raw)
  if (!d || isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}
