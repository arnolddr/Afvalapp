"use client";

import { useEffect, useState } from "react";

interface Snack {
  name: string;
  calories: number;
  protein: number;
  ingredients: string[];
}

interface DailyEntry {
  day: string;
  morning: Snack;
  afternoon: Snack;
}

interface ProfileSnacks {
  profile: string;
  daily: DailyEntry[];
}

interface Props {
  refreshKey?: number;
}

export default function DailySnacks({ refreshKey }: Props) {
  const [data, setData] = useState<ProfileSnacks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/snacks")
      .then((r) => r.json())
      .then((d) => setData(d.profiles || []))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">🍎 Tussendoortjes deze week</h3>
      </div>

      <div className="space-y-3">
        {data.map((p) => (
          <div key={p.profile}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              {p.profile}
            </p>
            <div className="grid gap-1.5">
              {p.daily.map((d) => (
                <div
                  key={d.day}
                  className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5"
                >
                  <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">
                    {d.day}
                  </span>
                  <span className="text-gray-700 truncate">
                    ☀️ {d.morning.name} · 🌙 {d.afternoon.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
