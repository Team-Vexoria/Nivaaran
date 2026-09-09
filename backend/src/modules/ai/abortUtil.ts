/**
 * NIVAARAN — Abort signal utility (SIH 26043)
 *
 * Links an outer AbortSignal (e.g. a pipeline-level timeout ceiling) to a local
 * AbortController that owns a per-request timeout, so a fetch is cancelled by
 * EITHER source — whichever fires first. Used across the Step 2/3/4 research
 * engines to make the worker's 4000ms research ceiling actually cancel in-flight
 * network calls instead of leaking them.
 */
export function linkAbortSignal(controller: AbortController, external?: AbortSignal): void {
  if (!external) return;
  if (external.aborted) {
    controller.abort();
    return;
  }
  external.addEventListener('abort', () => controller.abort(), { once: true });
}
