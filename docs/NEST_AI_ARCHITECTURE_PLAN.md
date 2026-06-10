# Nest AI Architecture Plan

Full adoption of **LangGraph**, **LangChain**, **Supermemory**, and **Vercel AI SDK** — with pluggable knowledge sources and human-in-the-loop conversation.

**UI constraint (non-negotiable):** Colors, layout topology, typography, spacing, and component structure stay exactly as designed in Figma. No visual redesign. SDK and agent changes are **transport/state only**.

**Auth constraint (non-negotiable):** Nest AI chat is **public** — no login required. Authentication is required **only** for admin (settings, knowledge base, logic docs). Do not add auth gates or redirects on chat. If the user **happens** to be logged in (e.g. from `/apply`), **optionally** bind memory and thread to their account — otherwise use anonymous `sessionId` only.

---

## Authentication & identity model

| Surface | Auth required? | Identity key | Notes |
|---------|----------------|--------------|-------|
| Nest AI chat (`/api/chat`, S1 flow, hero AI bar) | **No** | `sessionId` always; **`userId` if logged in** (optional bind) | Public route; may read Supabase session when present, never require it |
| Address autocomplete (`/api/addresses/suggest`) | **No** | Same `sessionId` + `state` param | Intent-gated search only |
| Property lookup (`/api/property`) | **No** | Same | Rate-limited by IP |
| Admin KB / settings (`/admin`, `/api/admin/*`) | **Yes** | Supabase user + `requireSuperadmin()` | Google OAuth |
| Apply / pre-qual (`/apply`, protected pages) | **Yes** | Supabase session | Separate from chat; may link `application.session_id` |

### Implications for agent & memory

**Resolution rule (server-side, best-effort):**

```typescript
const sessionId = body.sessionId ?? "anonymous";
const user = await getOptionalUser(); // null if not logged in — no error
const threadId = user?.id ?? sessionId;
const memoryContainer = user?.id
  ? `vestednest-user-${user.id}`
  : `vestednest-${sessionId}`;
```

| Logged in? | LangGraph `thread_id` | Supermemory container | Checkpointer |
|------------|----------------------|------------------------|--------------|
| **No** | `sessionId` | `vestednest-{sessionId}` | Same key |
| **Yes** | `userId` | `vestednest-user-{userId}` | Same key |

- **Always** accept `sessionId` from client (required for anonymous users).
- **Optionally** read Supabase session on `/api/chat` — if present, bind thread + memory to `userId`; if absent, fall back to `sessionId` with zero friction.
- **On login mid-session (optional enhancement):** merge `vestednest-{sessionId}` memories into `vestednest-user-{userId}` once, then prefer user container for subsequent turns.
- **Never block** chat when `getUser()` returns null.
- **Rate limiting** stays IP-based on public chat endpoints (existing `lib/rate-limit.ts`).

### Do not do

- Require sign-in before S1 chat or hero “send”
- Add `/api/chat` to `PROTECTED_API_PREFIXES`
- Redirect unauthenticated users from `/` or chat screens to `/login`
- Return 401 from `/api/chat` when session cookie is missing
- Require `userId` in request body from the client

---

## UI preservation charter

### Must not change
| Area | Files / selectors | Notes |
|------|-------------------|-------|
| Chat layout | `app-flow.tsx` screen S1 structure, `flow-chat-panel`, `flow-clog` | Same panel, header, footnote |
| Message bubbles | `.flow-msg`, `.flow-msg.u`, `.flow-msg.ai`, `.cb` | Same avatar, alignment, radii |
| Action chips | `.cacts`, `.cact` | Same green pill buttons |
| Input bar | `.flow-chat-inp`, `AddressAutocomplete`, send/mic buttons | Same hero/chat input chrome |
| Interaction picker | `interaction-picker.tsx` | Same address/eligibility option UI |
| Landing hero AI bar | `hero-ai-bar.tsx`, `hero-section.tsx` | Unchanged markup/classes |
| Flow screens | S0 landing → S1 chat → S2+ term sheet topology | Screen indices and chrome unchanged |
| CSS tokens | `app/flow.css`, `app/vestednest.css`, `app/landing.css` | No token/color/spacing edits unless bugfix |

### Allowed changes (invisible to user)
- Replace `fetch("/api/chat")` with `useChat` from `@ai-sdk/react`
- Map `UIMessage.parts` → existing render props (`content`, `actions`, `interaction`)
- Stream text into existing `.cb` div (same box, live fill)
- Server streaming protocol (`createUIMessageStreamResponse`)
- LangGraph checkpointer, tools, memory (all server-side)

### Forbidden
- New chat UI libraries (shadcn AI chat, default Vercel chat components)
- Replacing `AddressAutocomplete` with a generic `<input>`
- Moving action chips or picker to a different screen region
- Dark mode / layout experiments bundled with agent work
- Login walls on chat

---

## Completed interim work (preserve — do not regress)

Shipped before full LangGraph migration. Keep behavior until replaced by equivalent framework features.

| Item | Files | Behavior to preserve |
|------|-------|----------------------|
| Address intent gating | `lib/chat-intent.ts` | `isLikelyAddressQuery`, `isConversationalQuery` — no parcel search on FAQ/questions |
| Autocomplete gating | `address-autocomplete.tsx`, `hero-ai-bar.tsx`, `app-flow.tsx` | `addressSearchOnly` — suggest API only when input looks like an address |
| Suggest API gate | `app/api/addresses/suggest/route.ts` | Early return empty when not address intent |
| Tool guard | `lib/agent/tools.ts` | `lookup_property` skips when input is not address-like |
| Context-aware chips | `lib/chat-intent.ts` → `suggestFollowUpActions` | No random example addresses in action buttons |
| Humane errors | `friendlyChatError`, `app/api/chat/route.ts`, `use-loan-flow.ts` | Friendly assistant `message`, not raw `error` in bubble |
| FAQ fallback | `lib/agent/fallback.ts` | Distinct answers for DSCR below 1.0, adjust structure, check DSCR, bridge/refi, “use my last address” |
| System prompt guard | `lib/agent/nest-agent.ts` | Only call `lookup_property` for real addresses |

**Migration note:** When Phase 1 structured output and Phase 3 interrupts land, fold `chat-intent` rules into graph middleware / tool guards, then deprecate duplicate logic — do not delete until parity is verified.

---

## Conversation quality requirements

Human, context-aware chat — not a form with error strings.

### Intent & tools
- [ ] Answer the **actual question** before asking for an address again (e.g. “What if DSCR is below 1.0?” → near-DSCR explanation, not “send address”).
- [ ] Call `lookup_property` **only** when user provides a property address (street number + street cue or full parsed address).
- [ ] Use `search_knowledge_base` for policy/FAQ before improvising.
- [ ] Use `check_state_eligibility` for state questions (ND/SD block, NJ/NY attestation, VA LLC).

### Suggestions (action chips)
- [ ] Chips must match **current turn + thread context** (property loaded → term sheet actions; DSCR FAQ → follow-up questions; never paste example addresses as chips).
- [ ] Structured `actions` from agent (Phase 1+) replaces regex `ACTIONS:[...]` and interim `suggestFollowUpActions` defaults.

### Errors & failures
- [ ] All failures surface as **normal assistant messages** in `.cb` (humane tone).
- [ ] Address not found → conversational guidance, optional `InteractionPicker` — not red inline errors under input.
- [ ] API/LLM down → fallback message in bubble, not HTTP 500 text.
- [ ] Autocomplete: no red “not found” under input when user is typing a question (intent gating).

### Memory & continuity
- [ ] Reference prior context in-thread (“Earlier you looked at …”) via checkpointer + Supermemory container.
- [ ] **Logged in:** continuity follows `userId` across devices/sessions for that account.
- [ ] **Anonymous:** continuity scoped to `sessionId`; clearing `sessionStorage` starts a new thread (expected).
- [ ] “Use my last address” resolves from thread history without re-prompting generically.

### Citations (in-message, no new UI)
- [ ] When KB is used, weave source titles into reply text (e.g. “Per our Near-DSCR guidelines…”).
- [ ] Optional `data-citations` stream part for logging/debug; **no** new citation UI components.

---

## Target architecture

```
┌─────────────────────────────────────────────────────────────┐
│  UI (unchanged topology) — NO AUTH                           │
│  app-flow.tsx → flow-msg / cact / InteractionPicker          │
│  use-loan-flow.ts → useChat maps parts → ChatMessage         │
│  sessionId = sessionStorage vn-session                        │
│  userId = optional (Supabase session if logged in)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ DefaultChatTransport / stream
┌──────────────────────────▼──────────────────────────────────┐
│  /api/chat (public)  →  createUIMessageStreamResponse        │
│  /api/chat/resume    →  Command({ resume })                  │
│  @ai-sdk/langchain   →  toUIMessageStream(langGraphStream)   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  LangGraph: createReactAgent + checkpointer + interrupt      │
│  LangGraph Store: deal snapshot (property, term sheet params)  │
│  LangChain: tools, middleware (tool filter), structured output │
│  Supermemory: session profile + hybrid KB + connectors       │
│  InteractionRegistry (APIs) + KnowledgeSourceRegistry (RAG)  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Admin only (AUTH): /admin, /api/admin/* — KB, settings      │
└─────────────────────────────────────────────────────────────┘
```

---

## Registries (extend, do not replace)

### InteractionRegistry (existing — `lib/chat-interactions/`)
| Kind | Status | Agent exposure |
|------|--------|----------------|
| `address` | Live | `lookup_property` tool |
| `eligibility` | Live | `check_state_eligibility` tool |
| `rate-quote` | Stub | [x] Wire as `get_rate_quote` tool in Phase 1 |

Pattern: register handler → tool calls `resolveInteraction(kind, input)` → graph state / stream parts.

### KnowledgeSourceRegistry (new — `lib/knowledge-sources/`)
Mirror interaction pattern for ingest + search + optional `asTool()`.

---

## Dependencies to add

| Package | Purpose |
|---------|---------|
| `ai` | Core streaming, `createUIMessageStream`, transport |
| `@ai-sdk/react` | `useChat` client hook |
| `@ai-sdk/langchain` | LangGraph stream → UI message stream |
| `langchain` | `createAgent`, middleware, `toolStrategy` |
| `@langchain/langgraph-checkpoint-postgres` | Prod thread persistence (dev: `MemorySaver`) |
| Optional: `langsmith` | Traces and evals |

---

## Phase 0 — Foundation (Week 1)

**Goal:** Types and modules without any UI diff.

- [x] `docs/NEST_AI_ARCHITECTURE_PLAN.md` — this file
- [x] `lib/agent/graph.ts` — singleton compiled graph
- [x] `lib/agent/state.ts` — messages + `lastInteraction` + `propertyLookup` + `citations` + `dealSnapshot`
- [x] `lib/agent/response-schema.ts` — Zod `{ message, actions, citations? }`
- [x] `lib/knowledge-sources/registry.ts` — plugin interface (mirror `chat-interactions`)

**UI impact:** None.

---

## Phase 1 — LangGraph + LangChain full (Week 1–2)

**Goal:** Idiomatic agent runtime; server owns conversation state.

- [x] Replace hand-rolled `StateGraph` with `createAgent` (LangChain React agent; `createReactAgent` prebuilt deprecated)
- [ ] Add checkpointer: `MemorySaver` (dev), `PostgresSaver` (prod, Supabase URI) — **dev done; prod Postgres pending env**
- [x] `thread_id` = **`userId ?? sessionId`** (optional auth bind); remove client `history[]` from API contract
- [x] `getOptionalUser()` in chat route — bind when logged in, skip when not
- [x] Remove module globals in `tools.ts`; state via graph reducers + middleware
- [x] **LangGraph Store** (or extended state): persist `propertyLookup`, term sheet knobs across turns in same session
- [x] `recursionLimit: 10`
- [x] Structured output via `toolStrategy` — drop `ACTIONS:[...]` regex parsing
- [x] **LangChain middleware:** dynamic tool filter (address tools vs KB tools vs eligibility) per turn intent
- [x] Compile graph once per process
- [x] Wire `RATE_QUOTE_KIND` as agent tool (`get_rate_quote`)

**UI impact:** None initially (still JSON response until Phase 2).

**Client note:** `use-loan-flow` stops sending `history`; optional short transition where API accepts both.

---

## Phase 2 — Vercel AI SDK transport + streaming (Week 2)

**Goal:** Streaming and protocol — **zero visual change**.

### Server (`app/api/chat/route.ts`)
- [x] Return `createUIMessageStreamResponse({ stream })`
- [x] Pipe LangGraph via `@ai-sdk/langchain` `toUIMessageStream`
- [ ] Emit custom data parts (not new UI components):

| Stream part type | Maps to existing UI |
|------------------|---------------------|
| `text` (streamed) | `.cb` content |
| `data-actions` | `.cacts` / `.cact` buttons |
| `data-interaction` | `InteractionPicker` when `needs_selection` |
| `data-property` | `applyProperty()` side effect (invisible) |
| `data-progress` | Optional: replace “Nest AI is thinking…” text only, same position |
| `data-citations` | Optional: debug only; citations also woven into `text` |

### Client (`use-loan-flow.ts`)
- [x] Add `useChat` with `DefaultChatTransport({ api: '/api/chat' })`
- [x] Pass `sessionId` in request body (always); auth cookie sent automatically by browser when user is logged in — no client-side auth logic required
- [x] Adapter: `uiMessageToChatMessage()` — keeps `app-flow.tsx` props stable
- [x] `sendChat` → `sendMessage({ text })` — same call sites in `app-flow.tsx`
- [x] `handleAction` → `sendMessage({ text: action })` — unchanged chip behavior
- [x] `onSelectInteractionOption` → `POST /api/chat/resume` with `Command({ resume })`

### UI files — touch only if needed for streaming text
- [x] `app-flow.tsx`: render streamed `part.text` into existing `.cb` (no class changes)
- [x] Keep loading line from `useChat().status` — same “Nest AI is thinking…” position (+ optional `progressText`)

**UI impact:** Text may appear token-by-token inside the same bubble. No layout/color change.

---

## Phase 3 — Human-in-the-loop (Week 2–3)

**Goal:** Address pick and confirmations inside LangGraph interrupts.

- [x] `lookup_property` ambiguous → `interrupt({ kind: 'address', options, message })`
- [x] `POST /api/chat/resume` (public, `sessionId` + `thread_id`) with `Command({ resume })`
- [x] `InteractionPicker` `onSelect` triggers resume — **same component, same styling**
- [ ] Blocked states / low-confidence KB → optional `interrupt` with acknowledge pattern
- [x] All errors → streamed `text` part with humane copy (never raw `error` field in bubble)
- [x] Tool progress via `config.writer()` → `data-progress` (“Pulling rent comps…”) — partial: main chat `onData`; LangGraph writer bridge pending

**UI impact:** None — picker already exists; only wiring changes.

---

## Phase 4 — Supermemory full (Week 3)

**Goal:** Memory and KB at full SDK capability.

- [x] `search.memories({ searchMode: 'hybrid', rerank: true })` for KB tool
- [x] Keep `profile()` for session/user context (container per resolution rule above)
- [ ] Container tags:
  - `vestednest-{sessionId}` — anonymous chat turns + preferences
  - `vestednest-user-{userId}` — **when logged in** — durable user memory (primary)
  - `vn-kb-global` — admin policies, product docs
  - `vn-kb-logic` — synced excerpts from `logic_documents`
  - `vn-kb-{sourceId}` — per-connector / per-source
  - `vn-deal-{applicationId}` — optional, when application exists
- [ ] Native PDF/URL ingest via `client.add({ content: url })` in **admin** pipeline
- [ ] Supermemory **web-crawler** connector for recurring doc sources (admin-configured)
- [x] Agent tools: `save_user_preference`, `recall_user_context` (scoped to active container: user or session)
- [x] Optional one-time merge: anonymous `vestednest-{sessionId}` → `vestednest-user-{userId}` on first authenticated chat turn
- [ ] **Do not** require login for chat; user container is a bonus when session exists

**UI impact:** None.

---

## Phase 5 — Pluggable knowledge sources (Week 3–4)

**Goal:** Dynamic plug-in for PDF, URL, API, connectors — no agent rewrite per source.

### `KnowledgeSourceHandler` interface
```typescript
{
  id: string;
  kinds: ('markdown' | 'pdf' | 'url' | 'api' | 'connector')[];
  containerTag: string;
  ingest(input): Promise<IngestResult>;
  search(query): Promise<KnowledgeHit[]>;
  asTool?(): StructuredTool;
}
```

### Built-in sources
| ID | Ingest | Retrieval |
|----|--------|-------------|
| `admin-kb` | Admin CRUD → Supermemory | hybrid search — **registered** |
| `logic-docs` | Sync from `logic_documents` | tool + RAG — **registered** |
| `pdf-upload` | Storage URL → Supermemory | hybrid — **pending** |
| `url-fetch` | Supermemory `add(url)` | hybrid — **pending** |
| `web-crawler` | Supermemory connector | hybrid — **pending** |
| `api-snapshot` | On-demand API → `add` | search — **pending** |

### Admin (auth required)
- [ ] `knowledge_sources` table — enable/disable per source
- [ ] Extend `knowledge-manager.tsx` **in place** — connector toggle, same admin chrome
- [ ] Ingestion changes do **not** affect public chat auth model

**UI impact:** Admin only; user-facing chat unchanged.

---

## Phase 6 — Production polish (Week 4)

- [ ] LangSmith tracing (optional)
- [x] Rate limits unchanged on public `/api/chat` (IP-based)
- [ ] Eval suite (see below) — manual QA pending
- [x] Deprecate `runFallbackAgent` except Gemini-down path; fallback uses humane stream parts
- [x] Remove duplicate memory: no client `history[]`, no module globals
- [ ] Retire `lib/chat-intent.ts` defaults once structured output + middleware parity confirmed (kept as fallback)

**UI impact:** None.

### Eval scenarios (from original bug report + plan)
- [ ] Address → property data → contextual chips (term sheet, adjust, PDF) — not generic defaults
- [ ] “Adjust loan structure” after property → structure guidance, not “what’s the address?”
- [ ] “Check my DSCR” → explain + ask address in prose, chips without example addresses
- [ ] “What if DSCR is below 1.0?” → near-DSCR answer, not repeated generic blurb
- [ ] Typing question in input → no address suggest API / no red autocomplete error
- [ ] Address not found → humane bubble + picker if applicable
- [ ] ND/SD blocked → polite refusal with eligibility tool
- [ ] Anonymous user: full chat works with no Supabase session — memory on `sessionId` only
- [ ] Logged-in user: same chat UI, `thread_id` + Supermemory bind to `userId` (cookie present)
- [ ] Login after anonymous chat: optional merge of session memories into user container (non-blocking)
- [ ] Admin KB change reflects in answers (hybrid search) without chat login

---

## Future (post-v1, not blocking)

- Multi-node graph: intent router → quote / FAQ / address sub-agents
- **Inngest** (or cron) for scheduled KB reindex / connector sync
- **Unstructured.io** only if Supermemory PDF parsing is insufficient
- Automatic session → user memory merge on first authenticated `/api/chat` turn (best-effort, non-blocking)

---

## AI SDK ↔ existing component mapping

Keep `ChatMessage` shape as the **view model** so `app-flow.tsx` stays dumb:

```typescript
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;           // from text parts (concat or last)
  actions?: string[];        // from data-actions part
  interaction?: ChatInteraction; // from data-interaction part
};
```

```typescript
// use-loan-flow.ts — adapter (new, UI-agnostic)
function uiMessageToChatMessage(msg: UIMessage): ChatMessage {
  const text = msg.parts.filter(p => p.type === 'text').map(p => p.text).join('');
  const actions = msg.parts.find(p => p.type === 'data-actions')?.data?.actions;
  const interaction = msg.parts.find(p => p.type === 'data-interaction')?.data;
  return { role: msg.role, content: text, actions, interaction };
}
```

`app-flow.tsx` continues to use `f.messages.map(...)` — **no topology change**.

---

## File change matrix

| File | Change level | UI risk |
|------|--------------|---------|
| `lib/agent/*` | Major | None |
| `lib/chat-intent.ts` | Preserve → later deprecate | None |
| `app/api/chat/route.ts` | Major | None |
| `app/api/chat/resume/route.ts` | New (public) | None |
| `lib/supermemory.ts` | Medium | None |
| `lib/knowledge-sources/*` | New | None |
| `lib/chat-interactions/*` | Extend | None |
| `components/flow/use-loan-flow.ts` | Major | None (adapter pattern) |
| `components/flow/app-flow.tsx` | Minimal | Low — streaming text only |
| `components/flow/interaction-picker.tsx` | Minimal | None |
| `components/landing/hero-ai-bar.tsx` | Minimal | None |
| `app/flow.css`, `vestednest.css`, `landing.css` | **No edits** | — |
| `components/flow/types.ts` | Small | None |
| `lib/supabase/proxy.ts` | **Do not** add `/api/chat` to protected prefixes | — |

---

## What we are NOT adding

- Pinecone / Weaviate / separate vector DB (Supermemory is the layer)
- Default Vercel chat UI components
- New chat screen or drawer layout
- LlamaIndex (overlaps LangChain)
- **Login requirement for Nest AI chat**
- **Mandatory** login or **required** `userId` on chat requests (binding is optional enhancement only)

---

## Implementation order (recommended)

1. **Phase 1** — LangGraph checkpointer + `createReactAgent` + structured output + middleware
2. **Phase 2** — AI SDK stream behind `uiMessageToChatMessage` adapter (UI frozen)
3. **Phase 3** — Interrupts for address picker + `/api/chat/resume`
4. **Phase 4** — Supermemory hybrid + session/user containers (optional bind)
5. **Phase 5** — Knowledge source registry (admin-ingested)
6. **Phase 6** — Observability, evals, cleanup

---

## Success criteria

- [ ] Pixel-same chat screen (S1) before/after — bubbles, chips, input, picker
- [ ] **Chat works fully without authentication**
- [ ] **When logged in**, thread + memory bind to `userId` automatically (no extra UI step)
- [ ] **When anonymous**, thread + memory stay on `sessionId` only
- [ ] Admin KB/settings remain auth-gated only
- [ ] Streaming text in existing `.cb` bubbles
- [ ] Server-side thread persistence keyed by `userId ?? sessionId` (no client `history[]`)
- [ ] Address disambiguation via interrupt + same `InteractionPicker`
- [ ] KB/plugin sources added without agent core edits
- [ ] No raw API errors shown in chat bubbles
- [ ] Conversation quality evals pass (DSCR FAQ, adjust structure, intent gating)

---

## Next step when implementing

Start **Phase 1 + Phase 2 adapter** in one branch:
1. Server streams via AI SDK; `/api/chat` stays public
2. Client uses `useChat` + `sessionId`; `app-flow.tsx` still consumes `ChatMessage[]`
3. Server uses `getOptionalUser()` — bind `thread_id` / Supermemory to `userId` when cookie present
4. Screenshot diff S1 before merge — must match
5. Verify anonymous chat E2E — no redirects to `/login`
6. Verify logged-in user chat E2E — same UI, richer continuity via `userId` bind
