/** Opens Porter with the pickup address pre-filled. This is a deep link to Porter's own
 * site/app, not an API integration — no live Porter pricing is fetched or implied. */
export function buildPorterLink(address: string): string {
  return `https://porter.in/?search=${encodeURIComponent(address)}`;
}
