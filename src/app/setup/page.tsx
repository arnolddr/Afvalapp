"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Step = "check" | "create" | "scan" | "verify" | "done" | string;

interface CreatedUser { userId: number; username: string; qrDataUrl: string }

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("check");
  const [userIndex, setUserIndex] = useState(0); // 0 = first user, 1 = second user
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [currentUser, setCurrentUser] = useState<CreatedUser | null>(null);
  const [profile, setProfile] = useState("Ik");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/setup")
      .then((r) => r.json())
      .then((d) => {
        if (d.setupComplete) router.replace("/login");
        else setStep("create");
      })
      .catch(() => setStep("create"));
  }, [router]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== password2) { setError("Wachtwoorden komen niet overeen."); return; }
    if (password.length < 8) { setError("Wachtwoord minimaal 8 tekens."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, profile }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Aanmaken mislukt."); return; }
      setCurrentUser(data);
      setStep("scan");
    } finally {
      setLoading(false);
    }
  }

  async function verifyUser(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.userId, code: verifyCode.replace(/\D/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Code onjuist."); return; }
      if (userIndex === 0) {
        // First user done, create second user
        setUserIndex(1);
        setUsername(""); setPassword(""); setPassword2(""); setVerifyCode("");
        setProfile("Vriendin");
        setCurrentUser(null); setStep("create");
      } else {
        setStep("done");
      }
    } finally {
      setLoading(false);
    }
  }

  if (step === "check") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Laden…</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Klaar!</h2>
          <p className="text-sm text-gray-500 mb-6">Beide accounts zijn aangemaakt. Je kunt nu inloggen.</p>
          <button
            onClick={() => router.replace("/login")}
            className="w-full py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            Naar inlogscherm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-2xl mb-3">🥦</div>
          <h1 className="text-xl font-bold text-gray-900">AfvalApp instellen</h1>
          <p className="text-sm text-gray-400 mt-1">
            Account {userIndex + 1} van 2
          </p>
          {/* Progress */}
          <div className="flex gap-1.5 mt-3">
            {[0, 1].map((i) => (
              <div key={i} className={`h-1.5 w-12 rounded-full ${i < userIndex || step === "done" ? "bg-green-500" : i === userIndex ? "bg-green-300" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {step === "create" && (
            <form onSubmit={createUser} className="space-y-4">
              <h2 className="font-semibold text-gray-900">
                {userIndex === 0 ? "Jouw account" : "Account van je partner"}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profiel in de app</label>
                <div className="flex gap-2">
                  {["Ik", "Vriendin"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProfile(p)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        profile === p
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                      }`}
                    >
                      {p === "Ik" ? "👤 Ik" : "👤 Vriendin"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Dit account kan alleen het gewicht van dit profiel bewerken.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gebruikersnaam</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={userIndex === 0 ? "Bijv. Arnold" : "Bijv. Laura"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Minimaal 8 tekens"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord herhalen</label>
                <input
                  type="password"
                  required
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading || !username || !password || !password2}
                className="w-full py-2.5 bg-green-600 text-white font-medium rounded-xl disabled:opacity-50 hover:bg-green-700 transition-colors"
              >
                {loading ? "Bezig…" : "Account aanmaken"}
              </button>
            </form>
          )}

          {step === "scan" && currentUser && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Scan QR-code</h2>
              <p className="text-sm text-gray-500">
                Open <strong>Microsoft Authenticator</strong>, tik op <strong>+</strong> → <em>Ander account</em> en scan de QR-code.
              </p>
              <div className="flex justify-center">
                <Image
                  src={currentUser.qrDataUrl}
                  alt="TOTP QR code"
                  width={220}
                  height={220}
                  className="rounded-xl border border-gray-200"
                  unoptimized
                />
              </div>
              <button
                onClick={() => setStep("verify")}
                className="w-full py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
              >
                QR gescand →
              </button>
            </div>
          )}

          {step === "verify" && currentUser && (
            <form onSubmit={verifyUser} className="space-y-4">
              <h2 className="font-semibold text-gray-900">Verificatie</h2>
              <p className="text-sm text-gray-500">
                Voer de 6-cijferige code in die Microsoft Authenticator toont voor <strong>AfvalApp ({currentUser.username})</strong>.
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                required
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-center tracking-widest text-xl font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="000000"
              />
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading || verifyCode.length !== 6}
                className="w-full py-2.5 bg-green-600 text-white font-medium rounded-xl disabled:opacity-50 hover:bg-green-700 transition-colors"
              >
                {loading ? "Bezig…" : "Bevestigen"}
              </button>
              <button
                type="button"
                onClick={() => setStep("scan")}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ← QR-code opnieuw tonen
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
