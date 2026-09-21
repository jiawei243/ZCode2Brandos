// Bootstrap public API surface.

export * from "./app/create-app.js";
export type {
  ListWBrandSessionsOptions,
  PromptInput,
  ResolveLatestSessionOptions,
  ResumeOptions,
  RunWBrandProtocolAgentOptions,
  SendInputOptions,
  SendInputResult,
  SetLocaleResult,
  SteerTurnOptions,
  SubmitPromptOptions,
  UserPromptInput,
  WBrandApp,
  WBrandAppOptions,
  WBrandModelOption,
} from "./app/types.js";
export * from "./auth-login.js";
export {
  inspectWBrandCustomCommand,
  listWBrandCustomCommands,
  loadWBrandCustomCommand,
} from "./custom-commands.js";
export type {
  InspectWBrandCustomCommandOptions,
  ListWBrandCustomCommandsOptions,
  WBrandCustomCommandInspection,
} from "./custom-commands.js";
export { createModelAdapter } from "./model-factory.js";
export type { CreateModelAdapterOptions } from "./model-factory.js";
export { startProcessProviderRegistryRuntime } from "./app/process-provider-registry-runtime.js";
export type { ProcessProviderRegistryRuntimeOptions } from "./app/process-provider-registry-runtime.js";
export {
  addWBrandPluginMarketplace,
  getWBrandPluginsOverview,
  installWBrandMarketplacePlugin,
  listWBrandPlugins,
  removeWBrandPluginMarketplace,
  resolveWBrandPlugins,
  setWBrandPluginEnabled,
  uninstallWBrandMarketplacePlugin,
  updateWBrandMarketplacePlugin,
  updateWBrandPluginMarketplace,
  validateWBrandPluginPath,
} from "./plugins.js";
export type {
  AddWBrandMarketplaceOptions,
  InstallWBrandMarketplacePluginOptions,
  ListWBrandPluginsOptions,
  RemoveWBrandMarketplaceOptions,
  ResolveWBrandPluginsOptions,
  SetWBrandPluginEnabledOptions,
  SetWBrandPluginEnabledResult,
  UninstallWBrandMarketplacePluginOptions,
  UpdateWBrandMarketplaceOptions,
  UpdateWBrandMarketplacePluginOptions,
  ValidateWBrandPluginPathOptions,
  WBrandAvailablePluginData,
  WBrandInstalledPluginData,
  WBrandMarketplaceSummaryData,
  WBrandMarketplaceUpdateData,
  WBrandPluginInstallData,
  WBrandPluginUpdateData,
  WBrandPluginsOverviewData,
} from "./plugins.js";
export { runWBrandProtocolAgent } from "./wbrand-protocol-entrypoint.js";
// Exposed for the CLI's --output-format stream-json: it needs the same event
// shape the protocol server emits, rather than inventing a second one.
export { mapSessionEvent } from "./wbrand-protocol/session-mapper.js";
export { prepareWBrandTelemetryEnv, shutdownWBrandTelemetry } from "./telemetry-bootstrap.js";
export type { SessionTranscriptMessage, SessionTranscriptPart } from "./session-transcript.js";
export { listWBrandSessions, resolveLatestSession } from "./sessions.js";
export { inspectWBrandSkill, listWBrandSkills } from "./skills.js";
export type {
  InspectWBrandSkillOptions,
  ListWBrandSkillsOptions,
  WBrandSkillInspection,
} from "./skills.js";
// Exposed for the CLI's headless slash routing: it must decide "is this a real
// custom command?" with the *same* reserved-name gate the app facade's
// customCommandPromptResolver applies, or the two disagree and a reserved name
// reaches the model as literal prompt text. See prompt-command.ts.
export { isReservedWBrandSlashCommandName } from "./slash-command-surface.js";
export {
  grantWorkspaceHookTrust,
  inspectWorkspaceHookTrust,
  revokeWorkspaceHookTrustCli,
} from "./workspace-hook-trust-cli.js";
export type {
  WorkspaceHookTrustCliItem,
  WorkspaceHookTrustCliStatus,
  WorkspaceHookTrustCliTarget,
} from "./workspace-hook-trust-cli.js";
