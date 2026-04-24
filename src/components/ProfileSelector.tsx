"use client";

import { useEffect, useState } from "react";

interface Props {
  activeProfile: string;
  onChange: (profile: string) => void;
  onSnackChange?: () => void;
}

const PROFILES = ["Ik", "Vriendin"];

export default function ProfileSelector({ activeProfile, onChange, onSnackChange }: Props) {
  const [snackPrefs, setSnackPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data: { name: string; eatsSnacks: boolean }[]) => {
        const prefs: Record<string, boolean> = {};
        for (const p of data) prefs[p.name] = p.eatsSnacks;
        setSnackPrefs(prefs);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleSnacks(name: string) {
    const next = !snackPrefs[name];
    setSnackPrefs((prev) => ({ ...prev, [name]: next }));
    await fetch("/api/profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, eatsSnacks: next }),
    });
    onSnackChange?.();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-3">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {PROFILES.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeProfile === p
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {p === "Ik" ? "👤 Ik" : "👤 Vriendin"}
          </button>
        ))}
      </div>

      {!loading && (
        <label className="flex items-center justify-between cursor-pointer px-1">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Tussendoortjes voor {activeProfile}
            </p>
            <p className="text-xs text-gray-500">
              Voeg 2 gezonde snacks per dag toe
            </p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={snackPrefs[activeProfile] ?? false}
              onChange={() => toggleSnacks(activeProfile)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600 transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
        </label>
      )}
    </div>
  );
}
