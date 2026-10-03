/**
 * Returns the correct avatar image path for a user.
 *
 * Priority:
 *   1. Custom avatarPath stored in DB (if not one of the old .svg defaults)
 *   2. Heuristic: female names → female.jpg, everyone else → male.jpg
 *
 * Female-name heuristics:
 *   - Username is in a known-female list, OR
 *   - Username ends with 'a' or 'i' (common feminine endings)
 */

const KNOWN_FEMALE = new Set([
  'alice', 'carol', 'eve', 'emma', 'sophia', 'olivia', 'ava', 'isabella',
  'mia', 'amelia', 'harper', 'evelyn', 'abigail', 'emily', 'elizabeth',
  'grace', 'chloe', 'victoria', 'aria', 'scarlett', 'lily', 'sara', 'sarah',
  'anna', 'natalie', 'zoe', 'hannah', 'layla', 'luna', 'nora', 'ellie',
  'stella', 'maya', 'aurora', 'riley', 'zoey', 'leah', 'violet',
])

const SVG_PATTERN = /\/avatars\/avatar\d+\.svg/

/**
 * @param {string|null|undefined} avatarPath  - path stored in DB / user object
 * @param {string|null|undefined} username    - username string
 * @returns {string} absolute path to avatar image
 */
export function getAvatar(avatarPath, username) {
  // If there's a real custom path that isn't one of the placeholder SVGs, use it
  if (avatarPath && !SVG_PATTERN.test(avatarPath)) {
    return avatarPath
  }

  // Heuristic on username
  const name = (username || '').toLowerCase().trim()
  const isFemale =
    KNOWN_FEMALE.has(name) ||
    (name.length > 0 && (name.endsWith('a') || name.endsWith('i')))

  return isFemale ? '/avatars/female.jpg' : '/avatars/male.jpg'
}

export default getAvatar
