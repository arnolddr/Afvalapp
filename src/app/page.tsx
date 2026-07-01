"use client";

import { useEffect, useState } from "react";
import WeightInput from "@/components/WeightInput";
import WeightHistory from "@/components/WeightHistory";
import GeneratePlanButton from "@/components/GeneratePlanButton";
import MealPlanWeek from "@/components/MealPlanWeek";
import RecipesView from "@/components/RecipesView";
import ShoppingList from "@/components/ShoppingList";
import Navigation, { Tab } from "@/components/Navigation";
import ProfileSelector from "@/components/ProfileSelector";
import DailySnacks from "@/components/DailySnacks";
import InstallBanner from "@/components/InstallBanner";
import ProgressPanel from "@/components/ProgressPanel";
import SyncBadge from "@/components/SyncBadge";
import WeightTab from "@/components/WeightTab";
import { MealPlan, WeightEntry } from "@/types";
import { calculateWeightLossCalories } from "@/lib/calories";
import { getCached, setCached, drainQueue, clearOfflineData } from "@/lib/offlineStore";

interface ProfileData {
  name: string;
  eatsSnacks: boolean;
  height: number;
  age: number;
  gender: string;
  goalWeight: number | null;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [profile, setProfile] = useState("Ik");
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [snacksRefresh, setSnacksRefresh] = useState(0);
  const [profilesData, setProfilesData] = useState<Record<string, ProfileData>>({});
  const [regenerating, setRegenerating] = useState(false);
  const [ownedProfile, setOwnedProfile] = useState<string | null>(null);

  const latestWeight = weights[0]?.weight ?? null;
  const isThursday = new Date().getDay() === 4;

  const activeProfileData = profilesData[profile];
  const tdee = latestWeight
    ? calculateWeightLossCalories(
        latestWeight,
        activeProfileData?.height ?? 170,
        activeProfileData?.age ?? 35,
        (activeProfileData?.gender ?? "man") as "man" | "vrouw"
      )
    : null;

  function fetchProfiles() {
    const cached = getCached<ProfileData[]>("profiles");
    if (cached) {
      const map: Record<string, ProfileData> = {};
      for (const p of cached) map[p.name] = p;
      setProfilesData(map);
    }
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data: ProfileData[]) => {
        const map: Record<string, ProfileData> = {};
        for (const p of data) map[p.name] = p;
        setProfilesData(map);
        setCached("profiles", data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchProfiles();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { profile?: string | null }) => {
        setOwnedProfile(data.profile ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Show cached data instantly — no loading flash when offline
    const cached = getCached<WeightEntry[]>(`weight:${profile}`);
    if (cached) {
      setWeights(cached);
      setLoadingData(false);
    } else {
      setLoadingData(true);
    }

    fetch(`/api/weight?profile=${encodeURIComponent(profile)}`)
      .then((r) => r.json())
      .then((data: WeightEntry[]) => {
        setWeights(data);
        setCached(`weight:${profile}`, data);
        drainQueue().catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [profile]);

  useEffect(() => {
    const cached = getCached<MealPlan[]>(`mealplan:${profile}`);
    if (cached) {
      const sortedCached = [...cached].sort(
        (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
      );
      setMealPlans(cached);
      setSelectedPlanIdx(findCurrentPlanIdx(sortedCached));
    }

    fetch(`/api/meal-plan?profile=${encodeURIComponent(profile)}`)
      .then((r) => r.json())
      .then((plans: MealPlan[]) => {
        const sorted = [...plans].sort(
          (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
        );
        setMealPlans(plans);
        setSelectedPlanIdx(findCurrentPlanIdx(sorted));
        setCached(`mealplan:${profile}`, plans);
      })
      .catch(() => {});
  }, [profile, weights]);

  function handleWeightSaved(weight: number) {
    const newEntry: WeightEntry = {
      id: Date.now(),
      weight,
      unit: "kg",
      date: new Date().toISOString(),
    };
    setWeights((prev) => {
      const next = [newEntry, ...prev];
      setCached(`weight:${profile}`, next);
      return next;
    });
  }

  function handleWeightDeleted(id: number) {
    setWeights((prev) => {
      const next = prev.filter((e) => e.id !== id);
      setCached(`weight:${profile}`, next);
      return next;
    });
  }

function findCurrentPlanIdx(plans: MealPlan[]): number {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = 0; i < plans.length; i++) {
      const start = new Date(plans[i].weekStart);
      const end = new Date(plans[i].weekEnd);
      if (today >= start && today <= end) return i;
    }
    return plans.length - 1; // newest plan as fallback
  }

  function refreshPlans() {
    fetch(`/api/meal-plan?profile=${encodeURIComponent(profile)}`)
      .then((r) => r.json())
      .then((plans: MealPlan[]) => {
        const sorted = [...plans].sort(
          (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
        );
        setMealPlans(plans);
        setSelectedPlanIdx(findCurrentPlanIdx(sorted));
        setCached(`mealplan:${profile}`, plans);
      })
      .catch(() => {});
  }

  function handlePlanGenerated(_plan: MealPlan) {
    refreshPlans();
  }

  async function handleRegenerate() {
    const plan = sortedPlans[selectedPlanIdx];
    if (!plan || !latestWeight) return;
    setRegenerating(true);
    try {
      await fetch("/api/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: latestWeight,
          profile,
          weekStart: plan.weekStart,
          seed: Date.now(),
        }),
      });
      await refreshPlansAsync();
    } finally {
      setRegenerating(false);
    }
  }

  async function refreshPlansAsync() {
    const res = await fetch(`/api/meal-plan?profile=${encodeURIComponent(profile)}`);
    const plans: MealPlan[] = await res.json();
    const sorted = [...plans].sort(
      (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );
    setMealPlans(plans);
    setSelectedPlanIdx(findCurrentPlanIdx(sorted));
    setCached(`mealplan:${profile}`, plans);
  }

  const sortedPlans = [...mealPlans].sort(
    (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  );
  const currentPlan = sortedPlans[selectedPlanIdx];

  function isPlanCurrentWeek(plan: MealPlan): boolean {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today >= new Date(plan.weekStart) && today <= new Date(plan.weekEnd);
  }
  const selectedPlanIsCurrent = currentPlan != null && isPlanCurrentWeek(currentPlan);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white">
              🥦
            </div>
            <h1 className="text-base font-bold text-gray-900">AfvalApp</h1>
          </div>
          <div className="flex items-center gap-2">
            <SyncBadge />
            {isThursday && tab === "dashboard" && (
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                Donderdag — nieuw menu!
              </span>
            )}
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                clearOfflineData();
                window.location.href = "/login";
              }}
              title="Uitloggen"
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        <Navigation active={tab} onChange={setTab} />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* Dashboard */}
        {tab === "dashboard" && (
          <>
            <ProfileSelector
              activeProfile={profile}
              onChange={setProfile}
              onSnackChange={() => setSnacksRefresh((n) => n + 1)}
              onProfileSettingsChange={fetchProfiles}
            />

            {latestWeight && tdee && (
              <ProgressPanel
                entries={weights}
                goalWeight={activeProfileData?.goalWeight ?? null}
                tdee={tdee}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <WeightInput
                profile={profile}
                onWeightSaved={handleWeightSaved}
                canEdit={!ownedProfile || ownedProfile === profile}
              />
              <WeightHistory
                entries={weights}
                profile={profile}
                goalWeight={activeProfileData?.goalWeight ?? null}
                onDelete={handleWeightDeleted}
                canEdit={!ownedProfile || ownedProfile === profile}
              />
            </div>

            <GeneratePlanButton
              latestWeight={latestWeight}
              profile={profile}
              onPlanGenerated={handlePlanGenerated}
            />

            {loadingData ? (
              <div className="text-center py-12 text-gray-400">Laden...</div>
            ) : mealPlans.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="text-gray-600 font-medium">Nog geen weekmenu</p>
                <p className="text-gray-400 text-sm mt-1">
                  Voer je gewicht in en klik op &ldquo;Weekmenu genereren&rdquo; om
                  je eerste menu aan te maken.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {sortedPlans.map((plan, idx) => {
                    const isActive = idx === selectedPlanIdx;
                    const today = new Date();
                    today.setHours(12, 0, 0, 0);
                    const start = new Date(plan.weekStart);
                    const end = new Date(plan.weekEnd);
                    const isCurrent = today >= start && today <= end;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanIdx(idx)}
                        className={`flex-shrink-0 flex flex-col items-start px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span>
                          {new Date(plan.weekStart).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                          {" – "}
                          {new Date(plan.weekEnd).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                        </span>
                        {isCurrent && (
                          <span className={`text-xs font-normal ${isActive ? "text-green-100" : "text-green-600"}`}>
                            Huidige week
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {currentPlan && !selectedPlanIsCurrent && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 flex items-start gap-3">
                    <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Dit menu is van een vorige week</p>
                      <p className="text-xs text-amber-600 mt-0.5">Genereer een nieuw weekmenu voor de huidige week.</p>
                    </div>
                  </div>
                )}
                {currentPlan && (
                  <MealPlanWeek
                    plan={currentPlan}
                    activeProfile={profile}
                    onRegenerate={latestWeight ? handleRegenerate : undefined}
                    regenerating={regenerating}
                    onMealSwapped={refreshPlans}
                  />
                )}
              </div>
            )}

            {mealPlans.length > 0 && <DailySnacks refreshKey={snacksRefresh} />}
          </>
        )}

        {/* Recepten */}
        {tab === "recepten" && (
          <RecipesView plan={currentPlan ?? null} activeProfile={profile} onMealSwapped={refreshPlans} />
        )}

        {/* Boodschappen */}
        {tab === "boodschappen" && <ShoppingList />}

        {/* Gewicht */}
        {tab === "gewicht" && (
          <WeightTab
            entries={weights}
            goalWeight={activeProfileData?.goalWeight ?? null}
            profile={profile}
          />
        )}
      </main>

      <InstallBanner />
    </div>
  );
}
