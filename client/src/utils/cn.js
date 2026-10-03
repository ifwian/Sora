/**
 * Joins class names, filtering out falsy values.
 * Small local replacement for `clsx` so we don't add a dependency for this.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
