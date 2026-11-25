// Counts one visit each time the app is opened.
// Nothing about the visitor is sent: no ID, cookie, name or device details.
// See the Privacy notice in the app for what is collected.
export function countVisit() {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/visit');
    } else {
      fetch('/api/visit', { method: 'POST', keepalive: true }).catch(() => {});
    }
  } catch {
    // Counting is optional; the app works normally if it fails.
  }
}
