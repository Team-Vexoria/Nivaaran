export const syncBridge = (store) => { store.addListener('mutate', (e) => fetch('/api/v1' + e.path, {method: 'POST', body: JSON.stringify(e.payload)})); };
