import type { PlatformSettingDefinition } from "./types";

/**
 * Integration settings editable by superadmins.
 * Supabase URL/keys and deploy secrets stay in .env only.
 */
export const PLATFORM_SETTING_DEFINITIONS: PlatformSettingDefinition[] = [
  {
    key: "ai.gemini_api_key",
    label: "Gemini API key",
    description: "Google AI key for Nest AI chat (LangGraph)",
    type: "string",
    category: "ai",
    envKey: "GEMINI_API_KEY",
    isSecret: true,
  },
  {
    key: "ai.gemini_model",
    label: "Gemini model",
    description: "Model id for Nest AI (e.g. gemini-1.5-flash)",
    type: "string",
    category: "ai",
    envKey: "GEMINI_MODEL",
    defaultValue: "gemini-1.5-flash",
  },
  {
    key: "data.realie_api_key",
    label: "Realie API key",
    description: "Property data — https://docs.realie.ai",
    type: "string",
    category: "data",
    envKey: "REALIE_API_KEY",
    isSecret: true,
  },
  {
    key: "data.rentcast_api_key",
    label: "RentCast API key",
    description: "Rent comps enrichment — https://developers.rentcast.io",
    type: "string",
    category: "data",
    envKey: "RENTCAST_API_KEY",
    isSecret: true,
  },
  {
    key: "memory.supermemory_api_key",
    label: "Supermemory API key",
    description: "Conversation memory and knowledge base sync",
    type: "string",
    category: "memory",
    envKey: "SUPERMEMORY_API_KEY",
    isSecret: true,
  },
  {
    key: "email.sendgrid_api_key",
    label: "SendGrid API key",
    type: "string",
    category: "email",
    envKey: "SENDGRID_API_KEY",
    isSecret: true,
  },
  {
    key: "email.sendgrid_from",
    label: "SendGrid from email",
    type: "string",
    category: "email",
    envKey: "SENDGRID_FROM_EMAIL",
    defaultValue: "quotes@vestednest.com",
  },
  {
    key: "twilio.account_sid",
    label: "Twilio account SID",
    type: "string",
    category: "twilio",
    envKey: "TWILIO_ACCOUNT_SID",
  },
  {
    key: "twilio.auth_token",
    label: "Twilio auth token",
    type: "string",
    category: "twilio",
    envKey: "TWILIO_AUTH_TOKEN",
    isSecret: true,
  },
  {
    key: "twilio.phone_number",
    label: "Twilio from number",
    type: "string",
    category: "twilio",
    envKey: "TWILIO_PHONE_NUMBER",
  },
  {
    key: "app.base_url",
    label: "Public app URL",
    description: "Used for Twilio webhooks and email links",
    type: "string",
    category: "app",
    envKey: "NEXT_PUBLIC_APP_URL",
  },
  {
    key: "credit.vendor_api_key",
    label: "Credit vendor API key",
    description: "Soft pull at pre-qual (optional)",
    type: "string",
    category: "credit",
    envKey: "CREDIT_VENDOR_API_KEY",
    isSecret: true,
  },
];

export const PLATFORM_SETTING_BY_KEY = Object.fromEntries(
  PLATFORM_SETTING_DEFINITIONS.map((d) => [d.key, d]),
) as Record<string, PlatformSettingDefinition>;
