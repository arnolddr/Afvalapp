"use client";

interface Props {
  activeProfile: string;
  onChange: (profile: string) => void;
}

const PROFILES = ["Ik", "Vriendin"];

export default function ProfileSelector({ activeProfile, onChange }: Props) {
  return (
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
  );
}
