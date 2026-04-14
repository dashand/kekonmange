import React, { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem("kekonmange_install_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;

    // Android/Chrome: intercept install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowIOSHint(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("kekonmange_install_dismissed", Date.now().toString());
  };

  if (dismissed) return null;
  if (!deferredPrompt && !showIOSHint) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">Installer KekonMange</p>
            {deferredPrompt ? (
              <>
                <p className="text-xs text-gray-500 mt-0.5">
                  Acc{'é'}dez rapidement depuis votre {'é'}cran d'accueil
                </p>
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleInstall} size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-xl px-4">
                    Installer
                  </Button>
                  <Button onClick={handleDismiss} variant="ghost" size="sm"
                    className="text-xs text-gray-400 rounded-xl">
                    Plus tard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mt-0.5">
                  Appuyez sur{" "}
                  <Share className="inline h-3.5 w-3.5 text-blue-500 -mt-0.5" />{" "}
                  puis <strong>Sur l'{'é'}cran d'accueil</strong>
                </p>
                <Button onClick={handleDismiss} variant="ghost" size="sm"
                  className="text-xs text-gray-400 rounded-xl mt-2">
                  Compris
                </Button>
              </>
            )}
          </div>
          <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
