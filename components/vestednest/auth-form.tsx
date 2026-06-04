"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function openCenteredPopup() {
  const w = 480;
  const h = 640;
  const baseLeft = window.screenLeft ?? window.screenX ?? 0;
  const baseTop = window.screenTop ?? window.screenY ?? 0;
  const viewW = window.innerWidth || document.documentElement.clientWidth || w;
  const viewH = window.innerHeight || document.documentElement.clientHeight || h;
  const left = baseLeft + Math.max(0, (viewW - w) / 2);
  const top = baseTop + Math.max(0, (viewH - h) / 2);
  return window.open(
    "about:blank",
    "vn-google-auth",
    `popup=yes,width=${w},height=${h},left=${left},top=${top}`,
  );
}

export function AuthForm({ redirectTo = "/apply" }: { redirectTo?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`;

  useEffect(() => {
    function stopPolling() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;

      if (event.data === "vn-auth-success") {
        stopPolling();
        popupRef.current?.close();
        popupRef.current = null;
        setLoading(false);
        router.replace(next);
        router.refresh();
      } else if (event.data === "vn-auth-error") {
        stopPolling();
        popupRef.current?.close();
        popupRef.current = null;
        setLoading(false);
        setError("Sign-in failed. Please try again.");
      }
    }

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      stopPolling();
    };
  }, [router, next]);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);

    // Open synchronously so the browser does not treat it as a blocked popup.
    const popup = openCenteredPopup();
    popupRef.current = popup;

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        skipBrowserRedirect: true,
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          "/auth/popup-done",
        )}`,
      },
    });

    if (authError || !data?.url) {
      popup?.close();
      popupRef.current = null;
      setError(authError?.message ?? "Could not start sign-in.");
      setLoading(false);
      return;
    }

    if (!popup || popup.closed) {
      // Popup blocked — fall back to a full-page redirect.
      window.location.href = data.url;
      return;
    }

    popup.location.href = data.url;

    // Reset state if the user closes the popup without finishing.
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white text-base font-medium text-black disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Waiting for Google…" : "Continue with Google"}
      </button>
      {loading ? (
        <p className="mt-3 text-xs text-black/50">
          A Google sign-in window opened. Finish there, or close it to cancel.
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.61Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A8.99 8.99 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.29-1.71V4.96H.96a8.99 8.99 0 0 0 0 8.04l3.01-2.29Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A8.99 8.99 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
