"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useDeal } from "@/lib/deal/context";
import { getSessionId } from "@/components/flow/utils";
import { trackEvent } from "@/lib/analytics/events";

export function NestChatPanel() {
  const [open, setOpen] = useState(false);
  const { deal } = useDeal();

  function openChat() {
    setOpen(true);
    trackEvent("chat_opened");
  }

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId: getSessionId(), dealSnapshot: deal },
    }),
  });

  return (
    <>
      <button type="button" className="nest-chat-fab" onClick={openChat} aria-label="Ask Nest AI">
        Ask Nest AI
      </button>
      {open && (
        <div className="nest-chat-overlay" role="dialog" aria-label="Nest AI chat">
          <div className="nest-chat-panel">
            <header className="nest-chat-header">
              <strong>Nest AI</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
                ✕
              </button>
            </header>
            <div className="nest-chat-log">
              {messages.length === 0 && (
                <p className="nest-chat-hint">
                  Same engine, same deal. Ask about your rate, DSCR, or structure options.
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`nest-chat-msg ${m.role}`}>
                  {m.parts
                    ?.filter((p) => p.type === "text")
                    .map((p, i) => (
                      <span key={i}>{(p as { text: string }).text}</span>
                    ))}
                </div>
              ))}
            </div>
            <form
              className="nest-chat-input"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const text = String(fd.get("msg") ?? "").trim();
                if (!text) return;
                trackEvent("chat_message_sent");
                sendMessage({ text });
                e.currentTarget.reset();
              }}
            >
              <input name="msg" placeholder="Ask about your deal…" disabled={status === "streaming"} />
              <button type="submit" disabled={status === "streaming"}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
