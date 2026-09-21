import type { TuiReadClipboardImage, TuiWriteClipboardText } from "@wbrand/tui";
import type { UiLocale } from "@wbrand/i18n";
import type { Logger } from "@wbrand/contracts";
import type {
  createManagedCdpBrowserRuntime,
  ManagedCdpBrowserRuntimeOptions,
} from "@wbrand/adapters/browser";
import type {
  createModelAdapter,
  createWBrandApp,
  CreateModelAdapterOptions,
  configureCodingPlanApiKey,
  ConfigureCodingPlanApiKeyOptions,
  inspectWBrandSkill,
  inspectWorkspaceHookTrust,
  grantWorkspaceHookTrust,
  revokeWorkspaceHookTrustCli,
  inspectWBrandCustomCommand,
  InspectWBrandCustomCommandOptions,
  InspectWBrandSkillOptions,
  loginWBrandCli,
  loginBigmodelCodingPlan,
  LoginBigmodelCodingPlanOptions,
  LoginWBrandCliOptions,
  listWBrandCustomCommands,
  ListWBrandCustomCommandsOptions,
  loadWBrandCustomCommand,
  listWBrandSessions,
  listWBrandSkills,
  ListWBrandSessionsOptions,
  ListWBrandSkillsOptions,
  logoutWBrandCli,
  LogoutWBrandCliOptions,
  resolveLatestSession,
  ResolveLatestSessionOptions,
  RunWBrandProtocolAgentOptions,
  prepareWBrandTelemetryEnv,
  startProcessProviderRegistryRuntime,
  shutdownWBrandTelemetry,
  WBrandAppOptions,
} from "@wbrand/bootstrap";
import type { CliEnv, DotenvLoadResult, LoadCliDotenvOptions } from "./env.js";
import type { PluginsCommandOverrides } from "./plugins-command.js";
import type { CliShutdownProcess } from "./shutdown.js";
import type { resolveWorkspaceGitBranch } from "./tui-workspace-git.js";

export type BootstrapModule = typeof import("@wbrand/bootstrap");

export interface RunDependencies extends PluginsCommandOverrides {
  protocolLifecycle?: RunWBrandProtocolAgentOptions["lifecycle"];
  protocolInput?: NodeJS.ReadableStream;
  createManagedCdpBrowserRuntime?: (
    options?: ManagedCdpBrowserRuntimeOptions,
  ) => ReturnType<typeof createManagedCdpBrowserRuntime>;
  createModelAdapter?: (
    options?: CreateModelAdapterOptions,
  ) => ReturnType<typeof createModelAdapter>;
  createWBrandApp?: (
    options?: WBrandAppOptions,
  ) => Awaited<ReturnType<typeof createWBrandApp>> | ReturnType<typeof createWBrandApp>;
  /**
   * Session-event shaper for --output-format stream-json. Defaults to the
   * bootstrap module's, which is also what the protocol server uses; injectable
   * so a caller that supplies its own `createWBrandApp` (tests, embedders) can
   * still stream, since the bootstrap module is not loaded on that path.
   */
  mapSessionEvent?: BootstrapModule["mapSessionEvent"];
  cwd?: () => string;
  env?: CliEnv;
  inspectSkill?: (options: InspectWBrandSkillOptions) => ReturnType<typeof inspectWBrandSkill>;
  inspectWorkspaceHookTrust?: typeof inspectWorkspaceHookTrust;
  grantWorkspaceHookTrust?: typeof grantWorkspaceHookTrust;
  revokeWorkspaceHookTrustCli?: typeof revokeWorkspaceHookTrustCli;
  inspectCustomCommand?: (
    options: InspectWBrandCustomCommandOptions,
  ) => ReturnType<typeof inspectWBrandCustomCommand>;
  loginWBrandCli?: (options?: LoginWBrandCliOptions) => ReturnType<typeof loginWBrandCli>;
  loginBigmodelCodingPlan?: (
    options?: LoginBigmodelCodingPlanOptions,
  ) => ReturnType<typeof loginBigmodelCodingPlan>;
  configureCodingPlanApiKey?: (
    options: ConfigureCodingPlanApiKeyOptions,
  ) => ReturnType<typeof configureCodingPlanApiKey>;
  loadDotenv?: (options?: LoadCliDotenvOptions) => DotenvLoadResult;
  prepareWBrandTelemetryEnv?: typeof prepareWBrandTelemetryEnv;
  projectConfigPath?: string;
  listSessions?: (options: ListWBrandSessionsOptions) => ReturnType<typeof listWBrandSessions>;
  listCustomCommands?: (
    options: ListWBrandCustomCommandsOptions,
  ) => ReturnType<typeof listWBrandCustomCommands>;
  loadCustomCommand?: (
    options: InspectWBrandCustomCommandOptions,
  ) => ReturnType<typeof loadWBrandCustomCommand>;
  // headless slash 路由要和 app facade 的保留名 gate 用同一个判据；默认取 bootstrap 的，
  // 注入点只为让单测不必拉起整个 bootstrap 模块。见 prompt-command.ts。
  isReservedSlashCommandName?: BootstrapModule["isReservedWBrandSlashCommandName"];
  listSkills?: (options: ListWBrandSkillsOptions) => ReturnType<typeof listWBrandSkills>;
  logger?: Logger;
  readClipboardImage?: TuiReadClipboardImage;
  writeClipboardText?: TuiWriteClipboardText;
  resolveLatestSession?: (
    options: ResolveLatestSessionOptions,
  ) => ReturnType<typeof resolveLatestSession>;
  resolveWorkspaceGitBranch?: typeof resolveWorkspaceGitBranch;
  logoutWBrandCli?: (options?: LogoutWBrandCliOptions) => ReturnType<typeof logoutWBrandCli>;
  runWBrandProtocolAgent?: (options?: RunWBrandProtocolAgentOptions) => Promise<void>;
  runTui?: typeof import("@wbrand/tui").runTui;
  skipUserConfig?: boolean;
  userConfigPath?: string;
  exitProcess?: (code: number) => void;
  shutdownCleanupTimeoutMs?: number;
  shutdownProcess?: CliShutdownProcess;
  startProcessProviderRegistryRuntime?: typeof startProcessProviderRegistryRuntime;
  shutdownWBrandTelemetry?: typeof shutdownWBrandTelemetry;
}

export type CliPermissionMode = "build" | "plan" | "edit" | "yolo";
export type CliRuntimeMode = CliPermissionMode | "auto";

export interface CliModeState {
  current?: CliRuntimeMode;
  override?: CliPermissionMode;
}

export interface CliTargetRequest {
  objective: string;
  replaceExisting: boolean;
}

export type ModeCapableApp = Awaited<ReturnType<typeof createWBrandApp>> & {
  getMode?: () => CliRuntimeMode;
  setLocale?: (locale: UiLocale) => Promise<{ locale: "en-US" | "zh-CN" }>;
  setMode?: (mode: CliRuntimeMode) => Promise<{ mode: CliRuntimeMode }>;
};

export interface CliResumeRequest {
  continueSession: boolean;
  resumeSessionId?: string;
}
