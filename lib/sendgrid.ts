import sgMail from "@sendgrid/mail";

export function isSendGridConfigured(): boolean {
  return Boolean(process.env.SENDGRID_API_KEY);
}

export async function sendTermSheetEmail(input: {
  to: string;
  address: string;
  pdfBuffer: Buffer;
  filename: string;
}): Promise<{ sent: boolean; queued: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL ?? "quotes@vestednest.com";

  if (!apiKey) {
    console.info("[email] SENDGRID_API_KEY not set — queuing term sheet email", {
      to: input.to,
      address: input.address,
      filename: input.filename,
      size: input.pdfBuffer.length,
    });
    return { sent: false, queued: true };
  }

  sgMail.setApiKey(apiKey);

  try {
    await sgMail.send({
      to: input.to,
      from,
      subject: `Your Vested Nest term sheet — ${input.address}`,
      text: `Your indicative DSCR term sheet for ${input.address} is attached.\n\nThis is not a commitment to lend. Subject to appraisal and underwriting.\n\n— Vested Nest`,
      html: `<p>Your indicative DSCR term sheet for <strong>${input.address}</strong> is attached.</p>
        <p style="color:#666;font-size:13px">This is not a commitment to lend. Subject to appraisal and underwriting.</p>
        <p>— Vested Nest</p>`,
      attachments: [
        {
          content: input.pdfBuffer.toString("base64"),
          filename: input.filename,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
    return { sent: true, queued: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "SendGrid send failed";
    console.error("[email] SendGrid error:", message);
    return { sent: false, queued: false, error: message };
  }
}
