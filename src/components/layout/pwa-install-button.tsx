"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "android" | "ios" | "other";

function getPlatform(): Platform {
  if (typeof window === "undefined") return "other";

  const ua = window.navigator.userAgent.toLowerCase();
  const isIpadOs =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;

  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua) || isIpadOs) return "ios";
  return "other";
}

function isStandalone() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(max-width: 767px)").matches &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function getEnvironmentSnapshot() {
  return [
    getPlatform(),
    isMobileViewport() ? "mobile" : "desktop",
    isStandalone() ? "installed" : "browser",
  ].join(":");
}

function subscribeToEnvironment(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  window.addEventListener("appinstalled", onStoreChange);

  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
    window.removeEventListener("appinstalled", onStoreChange);
    displayMode.removeEventListener("change", onStoreChange);
  };
}

function usePwaEnvironment() {
  const snapshot = useSyncExternalStore(
    subscribeToEnvironment,
    getEnvironmentSnapshot,
    () => "other:desktop:browser",
  );

  return useMemo(() => {
    const [platform, viewport, installMode] = snapshot.split(":") as [
      Platform,
      "mobile" | "desktop",
      "installed" | "browser",
    ];

    return {
      platform,
      mobile: viewport === "mobile",
      installed: installMode === "installed",
    };
  }, [snapshot]);
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const { platform, mobile, installed } = usePwaEnvironment();
  const [installCompleted, setInstallCompleted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const canShow = useMemo(() => {
    if (installed || installCompleted || dismissed || !mobile) return false;
    if (platform === "ios") return true;
    if (platform === "android") return true;
    return installPrompt !== null;
  }, [dismissed, installCompleted, installPrompt, installed, mobile, platform]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The install button can still show platform guidance if registration
        // fails; browser install prompts simply will not fire.
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallCompleted(true);
      setInstallPrompt(null);
      setInstructionsOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") {
        setInstallCompleted(true);
      }
      return;
    }

    setInstructionsOpen(true);
  };

  if (!canShow) return null;

  return (
    <>
      <div className="md:hidden fixed left-4 bottom-28 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-outline-variant bg-surface-container/95 px-4 font-headline text-sm font-bold text-on-surface shadow-xl backdrop-blur active:scale-95 transition"
        >
          <span className="material-symbols-outlined text-primary text-xl">
            install_mobile
          </span>
          Install
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install app"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container/95 text-on-surface-variant shadow-xl backdrop-blur active:scale-95 transition"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {instructionsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-help-title"
          className="fixed inset-0 z-[70] flex items-end justify-center md:hidden"
        >
          <button
            type="button"
            aria-label="Close install help"
            className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm"
            onClick={() => setInstructionsOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-6 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between gap-4">
              <h2
                id="install-help-title"
                className="font-headline text-xl font-extrabold text-on-surface"
              >
                Install OM Player
              </h2>
              <button
                type="button"
                onClick={() => setInstructionsOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-on-surface-variant">
              {platform === "ios" ? (
                <>
                  <p>Tap Share in Safari, then choose Add to Home Screen.</p>
                  <p>Confirm Add to install OM Player on your home screen.</p>
                </>
              ) : (
                <>
                  <p>Open your browser menu and choose Install app.</p>
                  <p>If you do not see it, refresh this page and try again.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
