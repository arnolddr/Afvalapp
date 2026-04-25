"use client";

import { useState } from "react";
import { fetchQueued } from "@/lib/offlineStore";

interface Props {
  profile: string;
  onWeightSaved: (weight: number) => void;
}

export default function WeightInput({ profile, onWeightSaved }: Props) {
  const [weight, setWeight] = useState("");
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
      const { ok, queued } = await fetchQueued("/api/weight", "POST", { weight: w, profile });
      if (ok || queued) {
        setSuccess(queued ? "queued" : "saved");
        setWeight("");
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
      <form onSubmit={handleSubmit} className="flex gap-3">
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
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success === "saved" && (
        <p className="mt-2 text-sm text-green-600">Gewicht opgeslagen!</p>
      )}
      {success === "queued" && (
        <p className="mt-2 text-sm text-amber-600">Opgeslagen — wordt gesynchroniseerd zodra je verbinding hebt.</p>
      )}
    </div>
  );
}
