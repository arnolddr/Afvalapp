"use client";

import { useEffect, useState } from "react";
import { getCached, setCached, fetchQueued, drainQueue } from "@/lib/offlineStore";

interface ProfileData {
  name: string;
  eatsSnacks: boolean;
  height: number;
  age: number;
  gender: string;
  goalWeight: number | null;
}

interface Props {
  activeProfile: string;
  onChange: (profile: string) => void;
  onSnackChange?: () => void;
  onProfileSettingsChange?: () => void;
}

const PROFILES = ["Ik", "Vriendin"];

export default function ProfileSelector({ activeProfile, onChange, onSnackChange, onProfileSettingsChange }: Props) {
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [bodyOpen, setBodyOpen] = useState(false);
  const [localHeight, setLocalHeight] = useState("");
  const [localAge, setLocalAge] = useState("");
  const [localGender, setLocalGender] = useState<"man" | "vrouw">("man");
  const [localGoal, setLocalGoal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = getCached<ProfileData[]>("profiles");
    if (cached) {
      const map: Record<string, ProfileData> = {};
      for (const p of cached) map[p.name] = p;
      setProfiles(map);
      setLoading(false);
    }

    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data: ProfileData[]) => {
        const map: Record<string, ProfileData> = {};
        for (const p of data) map[p.name] = p;
        setProfiles(map);
        setCached("profiles", data);
        drainQueue().catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const p = profiles[activeProfile];
    if (p) {
      setLocalHeight(String(p.height ?? 170));
      setLocalAge(String(p.age ?? 35));
      setLocalGender((p.gender as "man" | "vrouw") ?? "man");
      setLocalGoal(p.goalWeight != null ? String(p.goalWeight) : "");
    }
  }, [activeProfile, profiles]);

  async function toggleSnacks(name: string) {
    const next = !profiles[name]?.eatsSnacks;
    setProfiles((prev) => {
      const updated = { ...prev, [name]: { ...prev[name], eatsSnacks: next } };
      setCached("profiles", Object.values(updated));
      return updated;
    });
    await fetchQueued("/api/profiles", "PATCH", { name, eatsSnacks: next });
    onSnackChange?.();
  }

  async function saveBodyData() {
    const h = parseInt(localHeight, 10);
    const a = parseInt(localAge, 10);
    if (isNaN(h) || h < 100 || h > 250) return;
    if (isNaN(a) || a < 10 || a > 120) return;
    const goalNum = localGoal.trim() === "" ? null : parseFloat(localGoal.replace(",", "."));
    if (goalNum !== null && (isNaN(goalNum) || goalNum < 30 || goalNum > 300)) return;
    setSaving(true);
    await fetchQueued("/api/profiles", "PATCH", {
      name: activeProfile,
      height: h,
      age: a,
      gender: localGender,
      goalWeight: goalNum,
    });
    setProfiles((prev) => {
      const updated = {
        ...prev,
        [activeProfile]: { ...prev[activeProfile], height: h, age: a, gender: localGender, goalWeight: goalNum },
      };
      setCached("profiles", Object.values(updated));
      return updated;
    });
    setSaving(false);
    setBodyOpen(false);
    onProfileSettingsChange?.();
  }

  const activeData = profiles[activeProfile];

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
        <>
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
                checked={activeData?.eatsSnacks ?? false}
                onChange={() => toggleSnacks(activeProfile)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => setBodyOpen((v) => !v)}
              className="w-full flex items-center justify-between px-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="font-medium">
                Lichaamsgegevens & doel
                {activeData && (
                  <span className="ml-1.5 font-normal text-gray-400">
                    {activeData.height} cm · {activeData.age} jr · {activeData.gender}
                    {activeData.goalWeight != null && ` · doel ${activeData.goalWeight} kg`}
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-400">{bodyOpen ? "▲" : "▼"}</span>
            </button>

            {bodyOpen && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Lengte (cm)</label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={localHeight}
                      onChange={(e) => setLocalHeight(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Leeftijd (jr)</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={localAge}
                      onChange={(e) => setLocalAge(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Geslacht</label>
                    <select
                      value={localGender}
                      onChange={(e) => setLocalGender(e.target.value as "man" | "vrouw")}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="man">Man</option>
                      <option value="vrouw">Vrouw</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Doelgewicht (kg) <span className="text-gray-400">— optioneel</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={localGoal}
                    onChange={(e) => setLocalGoal(e.target.value)}
                    placeholder="Bijv. 75"
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  onClick={saveBodyData}
                  disabled={saving}
                  className="w-full py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
