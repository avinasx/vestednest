import { toFullStateName } from "./state-names";
import { extractFicoFromCreditScore } from "./extract-fico";

export type SoftPullApplicant = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ssn?: string;
  dateOfBirth?: string;
};

export type SoftPullResult = {
  vendorRef: string | null;
  fico: number | null;
  reportLink: string | null;
  rawStatus: string;
};

const ISOFTPULL_URL = "https://app.isoftpull.com/api/v2/reports";

export function getISoftpullCredentials(): { apiKey: string; apiSecret: string } | null {
  const apiKey = process.env.CREDIT_VENDOR_API_KEY?.trim();
  const apiSecret = process.env.CREDIT_VENDOR_API_SECRET?.trim();
  if (!apiKey || !apiSecret) return null;
  return { apiKey, apiSecret };
}

export async function runISoftpullSoftPull(
  applicant: SoftPullApplicant,
): Promise<SoftPullResult> {
  const creds = getISoftpullCredentials();
  if (!creds) {
    throw new Error(
      "Credit vendor not configured — set CREDIT_VENDOR_API_KEY and CREDIT_VENDOR_API_SECRET",
    );
  }

  const body: Record<string, string> = {
    first_name: applicant.firstName,
    last_name: applicant.lastName,
    address: applicant.address,
    city: applicant.city,
    State: toFullStateName(applicant.state),
    zip: applicant.zip,
  };

  if (applicant.ssn) body.ssn = applicant.ssn.replace(/\D/g, "");
  if (applicant.dateOfBirth) body.date_of_birth = applicant.dateOfBirth;

  const res = await fetch(ISOFTPULL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": creds.apiKey,
      "api-secret": creds.apiSecret,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    status?: string;
    message?: string;
    reports?: Record<
      string,
      { status?: string; link?: string; full_feed?: { credit_score?: Record<string, { score?: number | string }> } }
    >;
    full_feed?: { credit_score?: Record<string, { score?: number | string }> };
    intelligence?: { result?: string; name?: string };
  };

  if (!res.ok || json.status === "failure") {
    throw new Error(json.message ?? `Credit vendor error (${res.status})`);
  }

  let fico: number | null = null;
  let reportLink: string | null = null;
  let vendorRef: string | null = null;

  if (json.full_feed?.credit_score) {
    fico = extractFicoFromCreditScore(json.full_feed.credit_score);
  }

  if (json.reports) {
    for (const [bureau, report] of Object.entries(json.reports)) {
      if (report.status === "success" && report.link) {
        reportLink = report.link;
        vendorRef = `${bureau}:${report.link}`;
      }
      if (!fico && report.full_feed?.credit_score) {
        fico = extractFicoFromCreditScore(report.full_feed.credit_score);
      }
    }
  }

  return {
    vendorRef,
    fico,
    reportLink,
    rawStatus: json.intelligence?.result ?? "completed",
  };
}
