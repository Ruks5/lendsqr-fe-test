export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'aborted';

/** A typed error so the UI can show a message that fits what went wrong. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export interface FetchJsonOptions {
  signal?: AbortSignal;
  /** Fail the request if no response arrives within this many ms. */
  timeoutMs?: number;
}

export const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * `fetch` wrapper that adds a timeout, respects a caller's AbortSignal and
 * turns every failure into an ApiError.
 */
export async function fetchJson<T = unknown>(
  url: string,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchJsonOptions = {},
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onCallerAbort = () => controller.abort();
  signal?.addEventListener('abort', onCallerAbort);

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
    } catch {
      if (timedOut) throw new ApiError('timeout', 'The server took too long to respond.');
      if (signal?.aborted) throw new ApiError('aborted', 'The request was cancelled.');
      throw new ApiError('network', 'We couldn’t reach the server. Check your connection and try again.');
    }

    if (!response.ok) {
      throw new ApiError('http', `The server responded with an error (${response.status}).`, response.status);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError('parse', 'The server sent a response we couldn’t read.');
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
