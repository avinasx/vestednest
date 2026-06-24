"use client";

import { useRef, useState } from "react";

type DocumentUploadProps = {
  applicationId: string;
  docType: string;
  label: string;
  onUploaded: (docType: string) => void;
};

export function DocumentUpload({ applicationId, docType, label, onUploaded }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);

    try {
      const urlRes = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          docType,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      const urlJson = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlJson.error ?? "Could not start upload");

      const uploadRes = await fetch(urlJson.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const confirmRes = await fetch("/api/documents/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          docType,
          filePath: urlJson.path,
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!confirmRes.ok) {
        const cj = await confirmRes.json();
        throw new Error(cj.error ?? "Could not save document record");
      }

      setStatus("done");
      onUploaded(docType);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="quote-row">
      <span>{label}</span>
      <div style={{ textAlign: "right" }}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.heic"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <button
          type="button"
          style={{ fontSize: 13, fontWeight: 600, color: status === "done" ? "var(--green)" : "var(--green)" }}
          disabled={status === "uploading"}
          onClick={() => inputRef.current?.click()}
        >
          {status === "uploading" ? "Uploading…" : status === "done" ? "Uploaded ✓" : "Upload"}
        </button>
        {error && <p style={{ fontSize: 11, color: "var(--red, #b3382c)", marginTop: 4 }}>{error}</p>}
      </div>
    </div>
  );
}
