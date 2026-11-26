


export function countVisit() {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/visit');
    } else {
      fetch('/api/visit', { method: 'POST', keepalive: true }).catch(() => {});
    }
  } catch {
    
  }
}
