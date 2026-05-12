"use client";

import { useState } from "react";
import { fetchQueued } from "@/lib/offlineStore";

interface Props {
  profile: string;
  onWeightSaved: (weight: number) => void;
  canEdit: boolean;
}

export default function WeightInput({ profile, onWeightSaved, canEdit }: Props) {
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<false | "saved" | "queued">(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 500) {
      setError("Voer een geldig gewicht in (20–500 kg)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { ok, queued } = await fetchQueued("/api/weight", "POST", {
        weight: w,
        profile,
        notes: notes.trim() || null,
      });
      if (ok || queued) {
        setSuccess(queued ? "queued" : "saved");
        setWeight("");
        setNotes("");
        setShowNotes(false);
        onWeightSaved(w);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Er ging iets mis. Probeer opnieuw.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Gewicht invoeren
      </h2>

      {!canEdit ? (
        <div className="flex items-start gap-3 text-gray-500">
          <svg className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm">
            Alleen <span className="font-medium text-gray-700">{profile}</span> kan hier gewicht invoeren.
            Log in als {profile} om dit te bewerken.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Bijv. 85.4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  kg
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? "Opslaan..." : "Opslaan"}
            </button>
          </div>

          {showNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bijv. sportdag, veel gegeten gisteren…"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              + notitie toevoegen
            </button>
          )}
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success === "saved" && (
        <p className="mt-2 text-sm text-green-600">Gewicht opgeslagen!</p>
      )}
      {success === "queued" && (
        <p className="mt-2 text-sm text-amber-600">
          Opgeslagen — wordt gesynchroniseerd zodra je verbinding hebt.
        </p>
      )}
    </div>
  );
}
