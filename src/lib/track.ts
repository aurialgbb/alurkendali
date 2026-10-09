// Local-only analytics: events stay in window.alurEvents and are broadcast as
// `alur:analytics` so a real provider can subscribe later. Nothing is sent anywhere.
type EventDetails = Record<string, string>;
declare global {
  interface Window {
    alurEvents?: { event: string; details: EventDetails; at: string }[];
  }
}

export function track(event: string, details: EventDetails = {}) {
  const query = new URLSearchParams(window.location.search);
  const attribution: EventDetails = {};
  ["utm_source", "utm_medium", "utm_campaign"].forEach((key) => {
    const value = query.get(key);
    if (value) attribution[key] = value.slice(0, 120);
  });
  const entry = {
    event,
    details: { ...attribution, ...details },
    at: new Date().toISOString(),
  };
  window.alurEvents = [...(window.alurEvents ?? []).slice(-99), entry];
  window.dispatchEvent(new CustomEvent("alur:analytics", { detail: entry }));
}
