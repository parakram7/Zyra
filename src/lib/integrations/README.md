# Integration adapters (placeholders)

These modules define the *interface* future integrations will implement, without faking
functionality that isn't actually wired up (per the product principle: no fake integrations).

- `maps.ts` — geocoding / static map URL builder. Currently returns a Google Maps search
  link built from the typed address, and formats `latitude`/`longitude` when present. Swap
  the implementation for the Google Maps or Mapbox SDK once `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  / `NEXT_PUBLIC_MAPBOX_TOKEN` is set — nothing else in the app needs to change.
- `transport-provider.ts` — "Open Porter" deep link builder. Does not call the Porter API
  (no scraping, no fake pricing) — it opens Porter's own site/app with the pickup address
  pre-filled. Replace with a real Porter API integration behind the same function signature
  when a partnership/API key exists.
- `messaging.ts` — WhatsApp deep link (`wa.me`) used today. SMS/WhatsApp Business
  API/push notification senders can implement the same `Notifier` interface later.
