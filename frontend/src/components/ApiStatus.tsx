import React, { useCallback, useEffect, useState } from 'react';

/**
 * Network/API connectivity indicator.
 *
 * Pings the backend health endpoint (`/api/health`) on the SAME origin by
 * default, so it flows through exactly the same proxy path the API client
 * uses:
 *   • Vite dev  → /api/health → localhost:5000 (backend)
 *   • Docker    → /api/health → backend:5000   (Nginx)
 * If `VITE_API_URL` is set, the health check follows that override too.
 *
 * On failure it shows an actionable message rather than silently swallowing
 * the problem — the point of this badge is that a broken frontend↔backend link
 * is visible instead of the UI falling back with no explanation.
 */
type ApiStatus = 'checking' | 'online' | 'offline';

const HEALTH_PATH = '/api/health';

function healthUrl(): string {
  return (import.meta.env?.VITE_API_URL || '') + HEALTH_PATH;
}

export const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [detail, setDetail] = useState<string>('');
  const [checkedAt, setCheckedAt] = useState<string>('');

  const check = useCallback(async () => {
    setStatus('checking');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const res = await fetch(healthUrl(), { signal: controller.signal });
      // Health returns 200 (OK) or 503 (db down) — both mean "backend reached".
      setStatus('online');
      let dbState = 'unknown';
      try {
        const body = (await res.json()) as { db?: string };
        dbState = body.db ?? 'unknown';
      } catch {
        /* non-JSON body — still online */
      }
      setDetail(`Backend connected · DB ${dbState}`);
    } catch {
      setStatus('offline');
      setDetail(
        'Backend unreachable — start the API (backend: npm run dev, port 5000) ' +
          'then refresh. CORS/proxy see client.ts + vite.config.ts.',
      );
    } finally {
      clearTimeout(timeout);
      setCheckedAt(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [check]);

  const tone =
    status === 'online'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
      : status === 'checking'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-700'
        : 'border-rose-500/50 bg-rose-500/10 text-rose-700';

  const dot =
    status === 'online'
      ? 'bg-emerald-500'
      : status === 'checking'
        ? 'bg-amber-500 animate-pulse'
        : 'bg-rose-500';

  const label =
    status === 'online' ? 'API Online' : status === 'checking' ? 'Checking API…' : 'API Offline';

  return (
    <div
      className={`fixed bottom-3 right-3 z-[1000] flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur ${tone}`}
      role="status"
      aria-live="polite"
      title={detail}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span>{label}</span>
      {status === 'offline' && (
        <button
          type="button"
          onClick={check}
          className="ml-1 underline decoration-dotted underline-offset-2 hover:no-underline"
        >
          Retry
        </button>
      )}
      {detail && <span className="hidden sm:inline opacity-70">· {detail}</span>}
      <span className="sr-only">{checkedAt ? `Checked at ${checkedAt}` : ''}</span>
    </div>
  );
};

export default ApiStatus;