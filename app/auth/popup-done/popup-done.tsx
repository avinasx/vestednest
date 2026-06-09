"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type AuthPopupMessage = "vn-auth-success" | "vn-auth-error" | "vn-auth-denied";

function resolveMessage(error: string | null): AuthPopupMessage {
  if (error === "denied") return "vn-auth-denied";
  if (error === "auth") return "vn-auth-error";
  return "vn-auth-success";
}

export function PopupDone() {
  const params = useSearchParams();
  const error = params.get("error");
  const message = resolveMessage(error);

  useEffect(() => {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, window.location.origin);
      window.close();
      return;
    }

    // Opened in the same tab (popup blocked / direct hit) — navigate normally.
    if (message === "vn-auth-denied") {
      window.location.replace("/login?error=denied");
      return;
    }
    if (message === "vn-auth-error") {
      window.location.replace("/login?error=auth");
      return;
    }
    window.location.replace("/apply");
  }, [message]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-vn-bg px-6">
      <p className="text-sm text-black/70">
        {message === "vn-auth-error"
          ? "Sign-in failed. You can close this window."
          : message === "vn-auth-denied"
            ? "Access denied. You can close this window."
            : "Signed in — closing…"}
      </p>
    </main>
  );
}
