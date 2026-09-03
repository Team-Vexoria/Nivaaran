export const syncBridge = (store: any) => {
  if (store && typeof store.addListener === 'function') {
    store.addListener('mutate', (e: any) => {
      fetch('/api/v1' + e.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e.payload),
      }).catch((err: Error) => console.error('Sync bridge error:', err));
    });
  }
};
