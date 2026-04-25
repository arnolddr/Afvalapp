"use client";

import { useEffect, useState } from "react";
import { pendingCount, drainQueue } from "@/lib/offlineStore";

export default function SyncBadge() {
  const [count, setCount] = useState(0);

  function refresh() {
    setCount(pendingCount());
  }

  useEffect(() => {
    refresh();

    function onOnline() {
      drainQueue().then(refresh).catch(() => {});
    }

    window.addEventListener("afval-queue-changed", refresh);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("afval-queue-changed", refresh);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span
      title={`${count} wijziging${count === 1 ? "" : "en"} wachten op synchronisatie`}
      className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      {count} in wacht
    </span>
  );
}
