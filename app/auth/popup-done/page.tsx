import { Suspense } from "react";
import { PopupDone } from "./popup-done";

export default function PopupDonePage() {
  return (
    <Suspense fallback={<PopupMessage />}>
      <PopupDone />
    </Suspense>
  );
}

function PopupMessage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-vn-bg px-6">
      <p className="text-sm text-black/70">Completing sign-in…</p>
    </main>
  );
}
