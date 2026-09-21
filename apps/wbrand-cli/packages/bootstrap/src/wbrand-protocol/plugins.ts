import {
  wbrandPluginsConfigureParamsSchema,
  wbrandPluginsResetConfigParamsSchema,
  wbrandPluginsInstallParamsSchema,
  wbrandPluginsMarketplaceAddParamsSchema,
  wbrandPluginsMarketplaceRemoveParamsSchema,
  wbrandPluginsMarketplaceUpdateParamsSchema,
  wbrandPluginsOverviewParamsSchema,
  wbrandPluginsListParamsSchema,
  wbrandPluginsSetEnabledParamsSchema,
  wbrandPluginsUninstallParamsSchema,
  wbrandPluginsUpdateParamsSchema,
  wbrandPluginsValidateParamsSchema,
  wbrandPluginsDescribeParamsSchema,
  wbrandPluginsRestoreBuiltinParamsSchema,
  type WBrandAvailablePluginSummary,
  type WBrandInstalledPluginSummary,
  type WBrandPluginComponentGroup,
  type WBrandPluginDiagnostic,
  type WBrandPluginInfo,
  type WBrandPluginMarketplaceSummary,
  type WBrandPluginsConfigureResult,
  type WBrandPluginsDescribeResult,
  type WBrandPluginsInstallResult,
  type WBrandPluginsListResult,
  type WBrandPluginsMarketplaceMutationResult,
  type WBrandPluginsOverviewResult,
  type WBrandPluginsRestoreBuiltinResult,
  type WBrandPluginsSetEnabledResult,
  type WBrandPluginsUninstallResult,
  type WBrandPluginsValidateResult,
} from "@wbrand/shared";
import type { PluginDiagnostic, PluginMetadata } from "@wbrand/contracts";
import {
  addWBrandPluginMarketplace,
  configureWBrandPlugin,
  describeWBrandPlugin,
  getWBrandPluginsOverview,
  installWBrandMarketplacePlugin,
  removeWBrandPluginMarketplace,
  resolveWBrandPlugins,
  resetWBrandPluginConfig,
  restoreBuiltinPlugin as restoreBuiltinPluginCore,
  setWBrandPluginEnabled,
  uninstallWBrandMarketplacePlugin,
  updateWBrandPluginMarketplace,
  validateWBrandPlugin,
} from "../plugins.js";
import { listInstalledPluginRecords } from "@wbrand/adapters/plugins";
import { withPluginStorageLock } from "../lib/plugin-storage-lock.js";
import { getCliStorageRoot, getPluginStorageRoot } from "../app/paths.js";
import { resolveOfficialPluginHostMcpServerNames } from "../app/official-plugin-definitions.js";
import { createConfig, resolvePath, type ConfigResult } from "@wbrand/adapters/config";
import { parseParams, type WBrandProtocolAgentServerContext } from "./server-types.js";

// 把 CLI 的 PluginMetadata 投影成协议可序列化的 WBrandPluginInfo (只保留 UI 需要的字段)。
function toPluginInfo(plugin: PluginMetadata, configResult?: ConfigResult): WBrandPluginInfo {
  const hostMcpServerNames = resolveOfficialPluginHostMcpServerNames(plugin.id);
  const configuredOptions = Object.fromEntries(
    Object.entries(plugin.configuredOptions ?? {}).filter(
      ([key]) => plugin.userConfig?.[key]?.sensitive !== true,
    ),
  );
  const enabledSource = configResult?.sources.plugins.enabled[plugin.id];
  const optionSources = configResult?.sources.plugins.options[plugin.id];
  const rootSource =
    plugin.source === "inline" && configResult
      ? resolveInlinePluginRootSource(plugin.rootPath, configResult)
      : undefined;
  return {
    id: plugin.id,
    name: plugin.name,
    ...(plugin.description !== undefined ? { description: plugin.description } : {}),
    ...(plugin.version !== undefined ? { version: plugin.version } : {}),
    enabled: plugin.enabled,
    source: plugin.source,
    marketplace: plugin.marketplace,
    // manifest 的作者/主页回退字段（商店 listing 优先）。
    ...(plugin.author !== undefined ? { author: plugin.author } : {}),
    ...(plugin.authorUrl !== undefined ? { authorUrl: plugin.authorUrl } : {}),
    ...(plugin.homepage !== undefined ? { homepage: plugin.homepage } : {}),
    skillCount: plugin.skillCount,
    skillRootCount: plugin.skillRootCount,
    commandRootCount: plugin.commandRootCount,
    // 权威组件清单随 list 下发，名称+描述由 loader 枚举（与启用态无关），供详情 UI 直接展示。
    components: plugin.components.map((group) => ({
      kind: group.kind,
      items: group.items.map((item) => ({
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
      })),
    })),
    declaredMcpServerNames: plugin.declaredMcpServerNames,
    mcpServerNames: plugin.mcpServerNames,
    ...(hostMcpServerNames.length > 0 ? { hostMcpServerNames } : {}),
    hookDetails: plugin.hookDetails,
    rootPath: plugin.rootPath,
    ...(plugin.userConfig ? { userConfig: plugin.userConfig } : {}),
    ...(Object.keys(configuredOptions).length > 0 ? { configuredOptions } : {}),
    ...(rootSource ? { rootSource } : {}),
    ...(enabledSource ? { enabledSource } : {}),
    ...(optionSources && Object.keys(optionSources).length > 0 ? { optionSources } : {}),
  };
}

function resolveInlinePluginRootSource(
  pluginRootPath: string,
  configResult: ConfigResult,
): "user" | "workspace" | undefined {
  const resolvedPluginRoot = normalizePluginRootForComparison(pluginRootPath);
  // Workspace 优先：同一路径同时出现在两层配置时，项目声明是更高优先级的归属证据。
  if (
    configResult.sources.plugins.dirs.workspace.some(
      (rootPath) => normalizePluginRootForComparison(rootPath) === resolvedPluginRoot,
    )
  ) {
    return "workspace";
  }
  if (
    configResult.sources.plugins.dirs.user.some(
      (rootPath) => normalizePluginRootForComparison(rootPath) === resolvedPluginRoot,
    )
  ) {
    return "user";
  }
  return undefined;
}

function createPluginConfigView(
  context: WBrandProtocolAgentServerContext,
  workspacePath: string,
  configScope: "user" | "workspace" | undefined,
): ConfigResult {
  // Settings 的 User 与 Workspace 现在是同一批 Host Plugin 的两个配置视图。
  // User 视图若继续加载 project config，会把 Workspace override 投影成 User 当前值；
  // 不传 workingDirectory 可保留 User/default 层，同时仍由调用方的 workspacePath 决定
  // package storage 和相对执行上下文。
  return createConfig({
    env: context.deps?.env,
    ...(configScope === "user" ? {} : { workingDirectory: workspacePath }),
  });
}

function createMissingConfiguredPluginInfos(
  configResult: ConfigResult,
  discoveredPluginIds: ReadonlySet<string>,
): WBrandPluginInfo[] {
  const configuredPluginIds = new Set([
    ...Object.keys(configResult.config.plugins.enabledPlugins),
    ...Object.keys(configResult.config.plugins.options),
  ]);
  return [...configuredPluginIds].flatMap((pluginId) => {
    if (discoveredPluginIds.has(pluginId)) return [];
    const separatorIndex = pluginId.lastIndexOf("@");
    if (separatorIndex <= 0 || separatorIndex === pluginId.length - 1) {
      return [];
    }
    const enabledSource = configResult.sources.plugins.enabled[pluginId];
    const optionSources = configResult.sources.plugins.options[pluginId];
    return [
      {
        id: pluginId,
        name: pluginId.slice(0, separatorIndex),
        enabled: configResult.config.plugins.enabledPlugins[pluginId] ?? false,
        source: "missing",
        marketplace: pluginId.slice(separatorIndex + 1),
        skillCount: 0,
        skillRootCount: 0,
        commandRootCount: 0,
        components: [],
        declaredMcpServerNames: [],
        mcpServerNames: [],
        rootPath: "",
        packageStatus: "missing",
        ...(enabledSource ? { enabledSource } : {}),
        ...(optionSources && Object.keys(optionSources).length > 0 ? { optionSources } : {}),
      },
    ];
  });
}

function normalizePluginRootForComparison(
  rootPath: string,
  platform: NodeJS.Platform = process.platform,
): string {
  const resolvedRoot = resolvePath(rootPath);
  // Windows 路径不区分大小写，且配置与 loader 可能分别返回正斜杠和反斜杠。
  // 若直接做字符串比较，会把同一个 Workspace plugins.dirs 根误判为无归属。
  return platform === "win32" ? resolvedRoot.replaceAll("\\", "/").toLowerCase() : resolvedRoot;
}

function toPluginDiagnostic(diagnostic: PluginDiagnostic): WBrandPluginDiagnostic {
  return {
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
    ...(diagnostic.pluginId !== undefined ? { pluginId: diagnostic.pluginId } : {}),
  };
}

export async function listPlugins(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsListResult> {
  const params = parseParams(wbrandPluginsListParamsSchema, rawParams);
  const configResult = createPluginConfigView(
    context,
    params.workspace.workspacePath,
    params.configScope,
  );
  const outcome = resolveWBrandPlugins({
    configResult,
    logger: context.logger,
    workingDirectory: params.workspace.workspacePath,
  });
  const plugins = outcome.plugins.map((plugin) => toPluginInfo(plugin, configResult));
  return {
    plugins: [
      ...plugins,
      ...createMissingConfiguredPluginInfos(
        configResult,
        new Set(plugins.map((plugin) => plugin.id)),
      ),
    ],
    diagnostics: outcome.diagnostics.map(toPluginDiagnostic),
  };
}

export async function setPluginEnabled(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
  abortSignal?: AbortSignal,
): Promise<WBrandPluginsSetEnabledResult> {
  const params = parseParams(wbrandPluginsSetEnabledParamsSchema, rawParams);
  abortSignal?.throwIfAborted();
  const result = await setWBrandPluginEnabled({
    enabled: params.enabled,
    logger: context.logger,
    plugin: params.pluginId,
    scope: params.scope,
    workingDirectory: params.workspace.workspacePath,
  });
  // 启用配置写入当前不可回滚；若取消在 IO 期间到达，只阻断后续响应和 UI 写入。
  abortSignal?.throwIfAborted();
  return {
    plugin: {
      ...toPluginInfo(result.plugin),
      enabledSource: params.scope ?? "user",
    },
    enabled: result.enabled,
  };
}

export async function getPluginsOverview(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsOverviewResult> {
  const params = parseParams(wbrandPluginsOverviewParamsSchema, rawParams);
  const overview = getWBrandPluginsOverview({
    configResult: createPluginConfigView(
      context,
      params.workspace.workspacePath,
      params.configScope,
    ),
    logger: context.logger,
    workingDirectory: params.workspace.workspacePath,
  });
  return {
    marketplaces: overview.marketplaces.map(toMarketplaceSummary),
    availablePlugins: overview.availablePlugins.map(toAvailablePluginSummary),
    installedPlugins: overview.installedPlugins.map(toInstalledPluginSummary),
    restorableBuiltins: overview.restorableBuiltins.map(toAvailablePluginSummary),
    diagnostics: overview.diagnostics.map(toPluginDiagnostic),
    capability: { supported: true },
  };
}

export async function addPluginMarketplace(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
  abortSignal?: AbortSignal,
): Promise<WBrandPluginsMarketplaceMutationResult> {
  const params = parseParams(wbrandPluginsMarketplaceAddParamsSchema, rawParams);
  const pluginStorageRoot = resolvePluginStorageRoot(params.workspace.workspacePath);
  const marketplace = await withPluginStorageLock(pluginStorageRoot, async () =>
    addWBrandPluginMarketplace({
      abortSignal,
      dryRun: params.dryRun,
      logger: context.logger,
      source: params.source,
      workingDirectory: params.workspace.workspacePath,
    }),
  );
  return { marketplace: toMarketplaceSummary(marketplace), diagnostics: [] };
}

export async function removePluginMarketplace(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsMarketplaceMutationResult> {
  const params = parseParams(wbrandPluginsMarketplaceRemoveParamsSchema, rawParams);
  const pluginStorageRoot = resolvePluginStorageRoot(params.workspace.workspacePath);
  await withPluginStorageLock(pluginStorageRoot, async () =>
    removeWBrandPluginMarketplace({
      logger: context.logger,
      marketplace: params.marketplace,
      workingDirectory: params.workspace.workspacePath,
    }),
  );
  return { diagnostics: [] };
}

export async function updatePluginMarketplace(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
  abortSignal?: AbortSignal,
): Promise<WBrandPluginsMarketplaceMutationResult> {
  const params = parseParams(wbrandPluginsMarketplaceUpdateParamsSchema, rawParams);
  const pluginStorageRoot = resolvePluginStorageRoot(params.workspace.workspacePath);
  const result = await withPluginStorageLock(pluginStorageRoot, async () =>
    updateWBrandPluginMarketplace({
      abortSignal,
      logger: context.logger,
      marketplace: params.marketplace,
      workingDirectory: params.workspace.workspacePath,
    }),
  );
  return {
    marketplaces: result.marketplaces.map(toMarketplaceSummary),
    diagnostics: result.diagnostics.map(toPluginDiagnostic),
  };
}

export async function installPlugin(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
  abortSignal?: AbortSignal,
): Promise<WBrandPluginsInstallResult> {
  const params = parseParams(wbrandPluginsInstallParamsSchema, rawParams);
  const pluginStorageRoot = resolvePluginStorageRoot(params.workspace.workspacePath);
  const result = await withPluginStorageLock(pluginStorageRoot, async () =>
    installWBrandMarketplacePlugin({
      abortSignal,
      dryRun: params.dryRun,
      logger: context.logger,
      marketplace: params.marketplace,
      pluginName: params.pluginName,
      scope: params.scope,
      workingDirectory: params.workspace.workspacePath,
    }),
  );
  return {
    dependencyClosure: result.dependencyClosure,
    installedPlugins: result.installedPlugins.map(toInstalledPluginSummary),
    diagnostics: result.diagnostics.map(toPluginDiagnostic),
  };
}

export async function uninstallPlugin(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsUninstallResult> {
  const params = parseParams(wbrandPluginsUninstallParamsSchema, rawParams);
  const removed = await uninstallWBrandMarketplacePlugin({
    logger: context.logger,
    marketplace: params.marketplace,
    pluginId: params.pluginId,
    pluginName: params.pluginName,
    removeCache: params.removeCache,
    workingDirectory: params.workspace.workspacePath,
  });
  return {
    ...(removed ? { removedPlugin: toInstalledPluginSummary(removed) } : {}),
    diagnostics: [],
  };
}

export async function updatePlugin(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsInstallResult> {
  const params = parseParams(wbrandPluginsUpdateParamsSchema, rawParams);
  const pluginStorageRoot = resolvePluginStorageRoot(params.workspace.workspacePath);
  const installed = listInstalledPluginRecords(pluginStorageRoot).filter((record) => {
    if (params.pluginId) return record.id === params.pluginId;
    if (params.marketplace) return record.marketplace === params.marketplace;
    return true;
  });
  // 与 uninstall 一样把整个重装循环串行化到同一 storageRoot 的 in-process 锁里，
  // 避免并发 update/install 交错读改写 installed_plugins.json / cache。
  return withPluginStorageLock(pluginStorageRoot, async () => {
    const installedPlugins: WBrandInstalledPluginSummary[] = [];
    const dependencyClosure: string[] = [];
    // 聚合每条记录重装产生的诊断：installWBrandMarketplacePlugin 失败时不抛错，而是返回
    // CLI 形态的 PluginDiagnostic（见其错误分支的 toMarketplaceInstallDiagnostic），
    // 这里逐条经协议侧 toPluginDiagnostic 投影成 WBrandPluginDiagnostic 回传，
    // 让失败的重装显式暴露，而不是静默"成功"。
    const diagnostics: WBrandPluginDiagnostic[] = [];
    for (const record of installed) {
      const result = await installWBrandMarketplacePlugin({
        logger: context.logger,
        marketplace: record.marketplace,
        pluginName: record.name,
        scope: record.scope,
        workingDirectory: params.workspace.workspacePath,
      });
      installedPlugins.push(...result.installedPlugins.map(toInstalledPluginSummary));
      dependencyClosure.push(...result.dependencyClosure);
      diagnostics.push(...result.diagnostics.map(toPluginDiagnostic));
    }
    return { dependencyClosure, installedPlugins, diagnostics };
  });
}

// 恢复一个被抑制（"卸载"）的内置插件：清除 suppressedBuiltins 标记并立即重新 seed。
// bootstrap 侧的同名函数被别名为 restoreBuiltinPluginCore，避免与本协议处理器重名。
export async function restoreBuiltinPlugin(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsRestoreBuiltinResult> {
  const params = parseParams(wbrandPluginsRestoreBuiltinParamsSchema, rawParams);
  await restoreBuiltinPluginCore({
    logger: context.logger,
    pluginId: params.pluginId,
    workingDirectory: params.workspace.workspacePath,
  });
  return { pluginId: params.pluginId, diagnostics: [] };
}

export async function configurePlugin(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsConfigureResult> {
  const params = parseParams(wbrandPluginsConfigureParamsSchema, rawParams);
  await configureWBrandPlugin({
    clearOptionKeys: params.clearOptionKeys,
    dryRun: params.dryRun,
    logger: context.logger,
    options: params.options,
    pluginId: params.pluginId,
    scope: params.scope,
    workingDirectory: params.workspace.workspacePath,
  });
  return { pluginId: params.pluginId, diagnostics: [] };
}

export async function resetPluginConfig(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsConfigureResult> {
  const params = parseParams(wbrandPluginsResetConfigParamsSchema, rawParams);
  await resetWBrandPluginConfig({
    logger: context.logger,
    pluginId: params.pluginId,
    scope: params.scope,
    workingDirectory: params.workspace.workspacePath,
  });
  return { pluginId: params.pluginId, diagnostics: [] };
}

export async function validatePlugin(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsValidateResult> {
  const params = parseParams(wbrandPluginsValidateParamsSchema, rawParams);
  const pluginStorageRoot = resolvePluginStorageRoot(params.workspace.workspacePath);
  const diagnostics = await withPluginStorageLock(pluginStorageRoot, async () =>
    validateWBrandPlugin({
      logger: context.logger,
      marketplace: params.marketplace,
      pluginName: params.pluginName,
      source: params.source,
      workingDirectory: params.workspace.workspacePath,
    }),
  );
  return {
    ok: diagnostics.every((diagnostic) => diagnostic.severity !== "error"),
    diagnostics: diagnostics.map(toPluginDiagnostic),
    compatibility: {
      runnable: ["skills", "commands", "hooks", "mcpServers", "userConfig"],
      diagnosticOnly: ["agents", "lspServers", "outputStyles", "channels", "settings"],
      unsupported: ["mcpb", "dxt", "npm", "hostPattern", "pathPattern"],
    },
  };
}

export async function describePlugin(
  context: WBrandProtocolAgentServerContext,
  rawParams: unknown,
): Promise<WBrandPluginsDescribeResult> {
  const params = parseParams(wbrandPluginsDescribeParamsSchema, rawParams);
  const pluginStorageRoot = resolvePluginStorageRoot(params.workspace.workspacePath);
  const result = await withPluginStorageLock(pluginStorageRoot, async () =>
    describeWBrandPlugin({
      logger: context.logger,
      marketplace: params.marketplace,
      pluginName: params.pluginName,
      workingDirectory: params.workspace.workspacePath,
    }),
  );
  const components: WBrandPluginComponentGroup[] = result.components.map((group) => ({
    kind: group.kind,
    items: group.items.map((item) => ({
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  }));
  const diagnostics = result.diagnostics.map(toPluginDiagnostic);
  return {
    components,
    ...(diagnostics.length > 0 ? { diagnostics } : {}),
    ...(result.metadata ? { metadata: result.metadata } : {}),
  };
}

function toMarketplaceSummary(input: {
  id: string;
  name: string;
  source: Record<string, unknown>;
  description?: string;
  lastUpdated?: string;
  pluginCount: number;
  isOfficial?: boolean;
  featured?: string[];
  refreshFailure?: WBrandPluginMarketplaceSummary["refreshFailure"];
}): WBrandPluginMarketplaceSummary {
  return {
    id: input.id,
    name: input.name,
    source: input.source,
    ...(input.description ? { description: input.description } : {}),
    ...(input.lastUpdated ? { lastUpdated: input.lastUpdated } : {}),
    pluginCount: input.pluginCount,
    ...(input.isOfficial !== undefined ? { isOfficial: input.isOfficial } : {}),
    ...(input.featured ? { featured: input.featured } : {}),
    ...(input.refreshFailure ? { refreshFailure: input.refreshFailure } : {}),
  };
}

function toAvailablePluginSummary(input: {
  id: string;
  name: string;
  marketplace: string;
  description?: string;
  version?: string;
  installed: boolean;
  componentTypes?: string[];
  listing?: WBrandAvailablePluginSummary["listing"];
}): WBrandAvailablePluginSummary {
  return {
    id: input.id,
    name: input.name,
    marketplace: input.marketplace,
    ...(input.description ? { description: input.description } : {}),
    ...(input.version ? { version: input.version } : {}),
    installed: input.installed,
    ...(input.componentTypes ? { componentTypes: input.componentTypes } : {}),
    ...(input.listing ? { listing: input.listing } : {}),
  };
}

function toInstalledPluginSummary(input: {
  id: string;
  name: string;
  marketplace: string;
  description?: string;
  version?: string;
  enabled: boolean;
  scope: "user" | "workspace";
  installPath?: string;
  installedAt?: string;
  componentTypes?: string[];
  hookDetails?: WBrandInstalledPluginSummary["hookDetails"];
  updateStatus?: "none" | "update-available" | "version-changed";
  latestVersion?: string;
  listing?: WBrandInstalledPluginSummary["listing"];
}): WBrandInstalledPluginSummary {
  return {
    id: input.id,
    name: input.name,
    marketplace: input.marketplace,
    ...(input.description ? { description: input.description } : {}),
    ...(input.version ? { version: input.version } : {}),
    enabled: input.enabled,
    scope: input.scope,
    ...(input.installPath ? { installPath: input.installPath } : {}),
    ...(input.installedAt ? { installedAt: input.installedAt } : {}),
    ...(input.componentTypes ? { componentTypes: input.componentTypes } : {}),
    ...(input.hookDetails ? { hookDetails: input.hookDetails } : {}),
    ...(input.updateStatus ? { updateStatus: input.updateStatus } : {}),
    ...(input.latestVersion ? { latestVersion: input.latestVersion } : {}),
    ...(input.listing ? { listing: input.listing } : {}),
  };
}

function resolvePluginStorageRoot(workingDirectory: string): string {
  const config = createConfig({ workingDirectory });
  const storageRoot = resolvePath(config.config.storage.dir);
  return getPluginStorageRoot(getCliStorageRoot(storageRoot));
}
