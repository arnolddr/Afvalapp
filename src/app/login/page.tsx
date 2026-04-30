"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Phase = "password" | "totp";

export default function LoginPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Inloggen mislukt."); return; }
      setPendingToken(data.pendingToken);
      setPhase("totp");
      setTimeout(() => codeRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }

  async function submitTotp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, code: code.replace(/\s/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Code onjuist."); return; }
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl mb-3">
            🥦
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AfvalApp</h1>
          <p className="text-sm text-gray-500 mt-1">
            {phase === "password" ? "Log in om door te gaan" : "Voer je authenticatorcode in"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {phase === "password" ? (
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gebruikersnaam
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Jouw naam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-2.5 bg-green-600 text-white font-medium rounded-xl disabled:opacity-50 hover:bg-green-700 transition-colors"
              >
                {loading ? "Bezig…" : "Doorgaan"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitTotp} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-600">
                  Open <strong>Microsoft Authenticator</strong> en voer de 6-cijferige code in voor <strong>AfvalApp</strong>.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authenticatorcode
                </label>
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setCode(v);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-center tracking-widest text-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="000000"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 bg-green-600 text-white font-medium rounded-xl disabled:opacity-50 hover:bg-green-700 transition-colors"
              >
                {loading ? "Bezig…" : "Inloggen"}
              </button>
              <button
                type="button"
                onClick={() => { setPhase("password"); setCode(""); setError(""); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ← Terug
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
