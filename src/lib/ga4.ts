export type Ga4Params = Record<string, string | number | boolean | null | undefined>;

/**
 * Safe GA4 event dispatcher.
 * Uses `window.gtag` if available (we load it from layout.tsx),
 * otherwise falls back to pushing into `window.dataLayer`.
 */
export function trackGa4Event(eventName: string, params?: Ga4Params) {
  if (typeof window === "undefined") return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const cleanParams: Record<string, unknown> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        cleanParams[k] = v;
      }
    }

    if (typeof w.gtag === "function") {
      w.gtag("event", eventName, cleanParams);
      return;
    }

    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: eventName, ...cleanParams });
  } catch {
    // no-op: tracking must never break the UX
  }
}

