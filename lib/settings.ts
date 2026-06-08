export {
  ADMIN_INTEGRATIONS_HINT,
  buildEffectiveEnv,
  buildEffectiveEnvForServer,
  ensureServerSettings,
  getIntegrationStatus,
  listPlatformSettingsForAdmin,
  resolvePlatformString,
  upsertPlatformSetting,
} from "./platform/settings-repository";

export {
  applyDotEnvToProcess,
  ensurePlatformSettingsSeeded,
  seedPlatformSettings,
} from "./platform/seed";

export {
  PLATFORM_SETTING_BY_KEY,
  PLATFORM_SETTING_DEFINITIONS,
} from "./platform/setting-definitions";

export type {
  PlatformSettingCategory,
  PlatformSettingDefinition,
  PlatformSettingView,
} from "./platform/types";
