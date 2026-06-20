const STORAGE_KEY = "vn-chat-init";

export type NestChatInit = {
  message?: string;
  state?: string;
  /** Product page the user launched chat from (e.g. "DSCR Loan"). */
  loanType?: string;
  /** Open full chat mode on the home flow (used by CTA buttons with no typed input). */
  openChat?: boolean;
};

type StoredNestChatInit = {
  message?: string;
  state?: string;
  loanType?: string;
  openChat?: boolean;
};

/** In-memory copy survives React Strict Mode remounts until chat bootstrap completes. */
let pendingLaunch: StoredNestChatInit | null = null;

function normalizeInit(init: NestChatInit = {}): StoredNestChatInit {
  return {
    message: init.message?.trim() || undefined,
    state: init.state?.trim() || undefined,
    loanType: init.loanType?.trim() || undefined,
    openChat: init.openChat || undefined,
  };
}

function readFromSessionStorage(): StoredNestChatInit | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredNestChatInit;
  } catch {
    return null;
  }
}

function hasLaunchPayload(init: StoredNestChatInit | null): init is StoredNestChatInit {
  return Boolean(init && (init.openChat || init.message || init.state || init.loanType));
}

export function buildNestChatLaunchMessage(init: NestChatInit): string | undefined {
  const text = init.message?.trim();
  const loanType = init.loanType?.trim();

  if (loanType && text) {
    return `${text} — I'm interested in a ${loanType}.`;
  }
  if (loanType) {
    return `I'm interested in a ${loanType}.`;
  }
  return text || undefined;
}

export function storeNestChatInit(init: NestChatInit = {}) {
  if (typeof window === "undefined") return;
  const normalized = normalizeInit(init);
  pendingLaunch = normalized;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

/** Read pending chat launch without clearing (safe for Strict Mode double-mount). */
export function getNestChatInit(): NestChatInit | null {
  if (pendingLaunch && hasLaunchPayload(pendingLaunch)) {
    return pendingLaunch;
  }
  const fromStorage = readFromSessionStorage();
  if (hasLaunchPayload(fromStorage)) {
    pendingLaunch = fromStorage;
    return fromStorage;
  }
  return null;
}

/** Clear after AppFlow has opened chat with the pending launch payload. */
export function markNestChatInitApplied() {
  pendingLaunch = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

/** @deprecated Prefer getNestChatInit + markNestChatInitApplied */
export function consumeNestChatInit(): NestChatInit | null {
  const init = getNestChatInit();
  if (init) markNestChatInitApplied();
  return init;
}

export function navigateToNestChat(
  navigate: (href: string) => void,
  init?: NestChatInit,
) {
  storeNestChatInit({ ...init, openChat: true });
  navigate("/");
}
