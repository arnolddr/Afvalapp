"use client";

import { useEffect, useState } from "react";

interface Category {
  label: string;
  items: string[];
}

interface ShoppingData {
  plan: { weekStart: string; weekEnd: string } | null;
  categories: Category[];
}

export default function ShoppingList() {
  const [data, setData] = useState<ShoppingData | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shopping-list")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        // Restore checked state from localStorage
        const saved = localStorage.getItem("shopping-checked");
        if (saved) setChecked(JSON.parse(saved));
      })
      .finally(() => setLoading(false));
  }, []);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("shopping-checked", JSON.stringify(next));
      return next;
    });
  }

  function clearChecked() {
    setChecked({});
    localStorage.removeItem("shopping-checked");
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Laden...</div>;
  }

  if (!data?.plan) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-4xl mb-3">🛒</p>
        <p className="text-gray-600 font-medium">Nog geen weekmenu</p>
        <p className="text-gray-400 text-sm mt-1">
          Genereer eerst een weekmenu op het dashboard.
        </p>
      </div>
    );
  }

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = data.categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Boodschappenlijst</h2>
          <p className="text-sm text-gray-500">
            {new Date(data.plan.weekStart).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
            {" – "}
            {new Date(data.plan.weekEnd).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {checkedCount}/{totalCount}
          </p>
          {checkedCount > 0 && (
            <button
              onClick={clearChecked}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Wis vinkjes
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : "0%" }}
        />
      </div>

      <div className="space-y-4">
        {data.categories.map((cat) => {
          const catChecked = cat.items.filter((item) => checked[item]).length;
          return (
            <div key={cat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm">{cat.label}</h3>
                <span className="text-xs text-gray-400">
                  {catChecked}/{cat.items.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {cat.items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => toggle(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked[item]
                            ? "bg-green-600 border-green-600"
                            : "border-gray-300"
                        }`}
                      >
                        {checked[item] && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${checked[item] ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {item}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
