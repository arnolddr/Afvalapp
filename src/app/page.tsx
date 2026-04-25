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
import { MealPlan, WeightEntry } from "@/types";
import { calculateWeightLossCalories } from "@/lib/calories";

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
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data: ProfileData[]) => {
        const map: Record<string, ProfileData> = {};
        for (const p of data) map[p.name] = p;
        setProfilesData(map);
      });
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    setLoadingData(true);
    fetch(`/api/weight?profile=${encodeURIComponent(profile)}`)
      .then((r) => r.json())
      .then(setWeights)
      .finally(() => setLoadingData(false));
  }, [profile]);

  useEffect(() => {
    fetch(`/api/meal-plan?profile=${encodeURIComponent(profile)}`)
      .then((r) => r.json())
      .then(setMealPlans);
  }, [profile, weights]);

  function handleWeightSaved(weight: number) {
    const newEntry: WeightEntry = {
      id: Date.now(),
      weight,
      unit: "kg",
      date: new Date().toISOString(),
    };
    setWeights((prev) => [newEntry, ...prev]);
  }

  function handleWeightDeleted(id: number) {
    setWeights((prev) => prev.filter((e) => e.id !== id));
  }

  function handlePlanGenerated(_plan: MealPlan) {
    // Refetch from server so the UI reflects the authoritative max-2 deduplicated list
    fetch(`/api/meal-plan?profile=${encodeURIComponent(profile)}`)
      .then((r) => r.json())
      .then((plans) => {
        setMealPlans(plans);
        setSelectedPlanIdx(0);
      });
  }

  const currentPlan = mealPlans[selectedPlanIdx];

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
          {isThursday && tab === "dashboard" && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              Donderdag — nieuw menu!
            </span>
          )}
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
              <WeightInput profile={profile} onWeightSaved={handleWeightSaved} />
              <WeightHistory
                entries={weights}
                profile={profile}
                goalWeight={activeProfileData?.goalWeight ?? null}
                onDelete={handleWeightDeleted}
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
                {mealPlans.length > 1 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {mealPlans.map((plan, idx) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanIdx(idx)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          idx === selectedPlanIdx
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {new Date(plan.weekStart).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                        {" – "}
                        {new Date(plan.weekEnd).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                      </button>
                    ))}
                  </div>
                )}
                {currentPlan && <MealPlanWeek plan={currentPlan} activeProfile={profile} />}
              </div>
            )}

            {mealPlans.length > 0 && <DailySnacks refreshKey={snacksRefresh} />}
          </>
        )}

        {/* Recepten */}
        {tab === "recepten" && (
          <RecipesView plan={currentPlan ?? null} activeProfile={profile} />
        )}

        {/* Boodschappen */}
        {tab === "boodschappen" && <ShoppingList />}
      </main>

      <InstallBanner />
    </div>
  );
}
