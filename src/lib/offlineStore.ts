export interface QueuedMutation {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  timestamp: number;
}

const QUEUE_KEY = "mutation-queue";

// ── Cache ────────────────────────────────────────────────────────────────────

export function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`cache:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setCached(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`cache:${key}`, JSON.stringify(data));
  } catch {}
}

// ── Mutation queue ────────────────────────────────────────────────────────────

function getQueue(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedMutation[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    notifyQueueChanged();
  } catch {}
}

function notifyQueueChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("afval-queue-changed"));
  }
}

export function pendingCount(): number {
  return getQueue().length;
}

function enqueue(url: string, method: string, body?: unknown): void {
  const queue = getQueue();
  queue.push({
    id: `${Date.now()}-${Math.random()}`,
    url,
    method,
    headers: body != null ? { "Content-Type": "application/json" } : undefined,
    body: body != null ? JSON.stringify(body) : undefined,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export async function drainQueue(): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;
  const remaining: QueuedMutation[] = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      // 404 on DELETE = already gone; 409 = conflict; both are "done"
      if (!res.ok && res.status !== 404 && res.status !== 409) {
        remaining.push(item);
      }
    } catch {
      // Still offline — stop trying, keep rest of queue
      remaining.push(...queue.slice(queue.indexOf(item)));
      break;
    }
  }
  saveQueue(remaining);
}

// ── Fetch with queue fallback ────────────────────────────────────────────────

/** Try a mutating request. If offline, queue it for later. Returns whether it was queued. */
export async function fetchQueued(
  url: string,
  method: string,
  body?: unknown
): Promise<{ ok: boolean; queued: boolean }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body != null ? { "Content-Type": "application/json" } : undefined,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    if (res.ok) {
      // Successful connection — take the opportunity to drain any queued items
      drainQueue().catch(() => {});
      return { ok: true, queued: false };
    }
    return { ok: false, queued: false };
  } catch {
    enqueue(url, method, body);
    return { ok: false, queued: true };
  }
}
