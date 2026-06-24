import { sendRawEmail } from "@/lib/sendgrid";
import { ensureServerSettings } from "@/lib/settings";

const ECC_INBOX = process.env.ECC_REFERRAL_EMAIL ?? "referrals@vestednest.com";

export async function sendEccReferralEmail(input: {
  applicationId: string;
  address: string;
  dealSnapshot?: unknown;
  email?: string;
}) {
  await ensureServerSettings();

  const body = JSON.stringify(
    {
      applicationId: input.applicationId,
      address: input.address,
      borrowerEmail: input.email,
      deal: input.dealSnapshot,
    },
    null,
    2,
  );

  // Uses SendGrid when configured; logs payload when not (manual ECC handoff)
  await sendRawEmail({
    to: ECC_INBOX,
    subject: `ECC referral — ${input.address}`,
    text: body,
  });
}
