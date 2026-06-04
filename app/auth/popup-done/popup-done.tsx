"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function PopupDone() {
  const params = useSearchParams();
  const isError = Boolean(params.get("error"));

  useEffect(() => {
    const message = isError ? "vn-auth-error" : "vn-auth-success";

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, window.location.origin);
      window.close();
      return;
    }

    // Opened in the same tab (popup blocked / direct hit) — navigate normally.
    window.location.replace(isError ? "/login?error=auth" : "/apply");
  }, [isError]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-vn-bg px-6">
      <p className="text-sm text-black/70">
        {isError ? "Sign-in failed. You can close this window." : "Signed in — closing…"}
      </p>
    </main>
  );
}
