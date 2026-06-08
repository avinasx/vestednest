export type PlatformSettingType = "string" | "number" | "boolean";

export type PlatformSettingCategory =
  | "ai"
  | "data"
  | "memory"
  | "email"
  | "twilio"
  | "credit"
  | "app";

export interface PlatformSettingDefinition {
  key: string;
  label: string;
  description?: string;
  type: PlatformSettingType;
  category: PlatformSettingCategory;
  /** Maps to process.env key when set. */
  envKey?: string;
  isSecret?: boolean;
  defaultValue?: string | number | boolean;
}

export interface PlatformSettingView {
  key: string;
  label: string;
  description: string;
  type: PlatformSettingType;
  category: PlatformSettingCategory;
  isSecret: boolean;
  value: string | number | boolean | null;
  source: "database" | "environment" | "default" | "unset";
  hasValue: boolean;
}
