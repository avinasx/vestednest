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
    return {
      sent: false,
      queued: false,
      error: "SendGrid not configured — set SENDGRID_API_KEY",
    };
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

export async function sendRawEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL ?? "quotes@vestednest.com";

  if (!apiKey) {
    console.info("[email] ECC referral (SendGrid not configured):", input.subject, input.text.slice(0, 200));
    return { sent: false, error: "SendGrid not configured" };
  }

  sgMail.setApiKey(apiKey);
  try {
    await sgMail.send({ to: input.to, from, subject: input.subject, text: input.text });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}
