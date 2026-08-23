/** Builds a Google Maps link from whatever location data we have — used until a
 * geocoding provider (Google Maps / Mapbox) is connected via NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. */
export function buildMapsLink(input: {
  mapsLink?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}): string | null {
  if (input.mapsLink) return input.mapsLink;
  if (input.latitude != null && input.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${input.latitude},${input.longitude}`;
  }
  if (input.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.address)}`;
  }
  return null;
}

export const MAPS_PROVIDER_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_MAPBOX_TOKEN
);
