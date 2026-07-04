import { useEffect, useState } from "react";

const DISMISSED_KEY = "kyc_install_button_dismissed";

function getIsStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function getWasDismissed() {
  if (typeof localStorage === "undefined") return false;

  return localStorage.getItem(DISMISSED_KEY) === "true";
}

function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => getIsStandalone());
  const [wasDismissed, setWasDismissed] = useState(() => getWasDismissed());

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISSED_KEY, "true");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      setShowHelp((current) => !current);
      return;
    }

    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setCanInstall(false);
      localStorage.setItem(DISMISSED_KEY, "true");
      setWasDismissed(true);
    }

    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setWasDismissed(true);
    setShowHelp(false);
  }

  if (isInstalled || wasDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      {showHelp && !canInstall && (
        <div className="w-64 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">Install app</p>
              <InstallHelp />
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500 active:scale-[0.95]"
              aria-label="Dismiss install help"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleInstallClick}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-2xl text-white shadow-xl shadow-slate-900/20 ring-1 ring-white/30 transition active:scale-[0.95]"
        aria-label={canInstall ? "Install app" : "Show install instructions"}
        title={canInstall ? "Install app" : "How to install"}
      >
        📲
      </button>
    </div>
  );
}

function InstallHelp() {
  const isIOS =
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);

  const isAndroid = /android/i.test(window.navigator.userAgent);

  if (isIOS) {
    return (
      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
        On iPhone/iPad: open in Safari, tap Share, then Add to Home Screen.
      </p>
    );
  }

  if (isAndroid) {
    return (
      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
        On Android: tap this button if install is available. Otherwise use
        Chrome menu → Add to Home screen.
      </p>
    );
  }

  return (
    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
      On desktop Chrome/Edge: use the install icon in the address bar or browser
      menu → Install app.
    </p>
  );
}

export default InstallAppButton;
