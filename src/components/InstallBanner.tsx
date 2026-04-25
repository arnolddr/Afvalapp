"use client";

import { useEffect, useState } from "react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = sessionStorage.getItem("install-banner-dismissed");
    if (isIos && !isStandalone && !dismissed) setShow(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem("install-banner-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-8">
      <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex gap-3 items-start">
        <span className="text-2xl flex-shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Installeer AfvalApp</p>
          <p className="text-xs text-gray-300 mt-0.5">
            Tik op{" "}
            <span className="inline-flex items-center bg-gray-700 rounded px-1 py-0.5 text-xs font-mono">
              Deel ↑
            </span>{" "}
            en kies <strong>&ldquo;Zet op beginscherm&rdquo;</strong> om de app
            te installeren op je iPhone.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-400 hover:text-white text-xl leading-none flex-shrink-0 mt-0.5"
        >
          ×
        </button>
      </div>
    </div>
  );
}
