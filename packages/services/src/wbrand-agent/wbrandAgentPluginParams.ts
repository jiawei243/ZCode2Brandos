import type {
  WBrandAgentMcpServer,
  WBrandAutomationScheduleRule,
  WBrandMcpListMode,
  ModelSelection,
} from "@wbrand/shared";

export interface WBrandAgentWorkspaceTarget {
  workspacePath: string;
  workspaceIdentity?: string;
  /** 远程 workspace 的运行时会话身份；只用于隔离/路由，不能替代 workspacePath。 */
  remoteSessionId?: string;
}

export interface WBrandAgentPluginViewParams extends WBrandAgentWorkspaceTarget {
  configScope?: "user" | "workspace";
}

export interface WBrandAgentListMcpServerStatusesParams extends WBrandAgentWorkspaceTarget {
  mcpServers?: WBrandAgentMcpServer[];
  mode?: WBrandMcpListMode;
}

export interface WBrandAgentAddPluginMarketplaceParams extends WBrandAgentWorkspaceTarget {
  dryRun?: boolean;
  operationId?: string;
  source: string;
}

export interface WBrandAgentRemovePluginMarketplaceParams extends WBrandAgentWorkspaceTarget {
  marketplace: string;
}

export interface WBrandAgentUpdatePluginMarketplaceParams extends WBrandAgentWorkspaceTarget {
  marketplace?: string;
  operationId?: string;
}

export interface WBrandAgentInstallPluginParams extends WBrandAgentWorkspaceTarget {
  dryRun?: boolean;
  marketplace: string;
  operationId?: string;
  pluginName: string;
  scope?: "user" | "workspace";
}

export interface WBrandAgentCancelPluginOperationParams {
  operationId: string;
}

export interface WBrandAgentUninstallPluginParams extends WBrandAgentWorkspaceTarget {
  marketplace?: string;
  pluginId?: string;
  pluginName?: string;
  removeCache?: boolean;
}

export interface WBrandAgentUpdatePluginParams extends WBrandAgentWorkspaceTarget {
  pluginId?: string;
  marketplace?: string;
}

export interface WBrandAgentRestoreBuiltinPluginParams extends WBrandAgentWorkspaceTarget {
  pluginId: string;
}

export interface WBrandAgentConfigurePluginParams extends WBrandAgentWorkspaceTarget {
  clearOptionKeys?: string[];
  dryRun?: boolean;
  options: Record<string, unknown>;
  pluginId: string;
  scope?: "user" | "workspace";
}

export interface WBrandAgentResetPluginConfigParams extends WBrandAgentWorkspaceTarget {
  pluginId: string;
  scope?: "user" | "workspace";
}

export interface WBrandAgentValidatePluginParams extends WBrandAgentWorkspaceTarget {
  marketplace?: string;
  pluginName?: string;
  source?: string;
}

export interface WBrandAgentDescribePluginParams extends WBrandAgentWorkspaceTarget {
  marketplace: string;
  pluginName: string;
}

export interface WBrandAgentSetPluginEnabledParams extends WBrandAgentWorkspaceTarget {
  enabled: boolean;
  operationId?: string;
  pluginId: string;
  scope?: "user" | "workspace";
}

// Plugin 对话引用 catalog：
// 带 sessionId → session-owned 冻结 catalog（必须路由到持有该 session 的 workspace client）；
// 不带 → workspace 当前 catalog（新建草稿 Picker）。
export interface WBrandAgentPluginReferenceCatalogParams extends WBrandAgentWorkspaceTarget {
  sessionId?: string;
}

// Composer Skill catalog：与 Plugin 引用相同，以 sessionId 区分 workspace 当前目录和
// resident Session runtime 快照；不参与 Settings 管理目录。
export interface WBrandAgentSkillReferenceCatalogParams extends WBrandAgentWorkspaceTarget {
  sessionId?: string;
}
export interface WBrandAgentResolveSuggestedPluginReferenceParams extends WBrandAgentWorkspaceTarget {
  stableId: string;
  operationId: string;
  clientMode: "desktop-continuous" | "web-remote-replayable";
  deliveryKind: "desktop-continuous" | "web-remote-replayable";
}

// ---- 定时任务(automation)管理参数 ----

export interface WBrandAgentCreateAutomationParams extends WBrandAgentWorkspaceTarget {
  title: string;
  cronExpr: string;
  relativeDelayMinutes?: number;
  prompt: string;
  modelSelection?: ModelSelection;
  mode?: string;
  recurring?: boolean;
  maxRuns?: number;
  endAt?: number;
  scheduleRule?: WBrandAutomationScheduleRule;
}

export interface WBrandAgentUpdateAutomationParams extends WBrandAgentWorkspaceTarget {
  automationId: string;
  title?: string;
  cronExpr?: string;
  prompt?: string;
  modelSelection?: ModelSelection | null;
  mode?: string | null;
  recurring?: boolean;
  maxRuns?: number | null;
  endAt?: number | null;
  scheduleRule?: WBrandAutomationScheduleRule | null;
  scheduleEditedByUser?: boolean;
}

export interface WBrandAgentAutomationIdParams extends WBrandAgentWorkspaceTarget {
  automationId: string;
}

export interface WBrandAgentSetAutomationEnabledParams extends WBrandAgentWorkspaceTarget {
  automationId: string;
  enabled: boolean;
}

export interface WBrandAgentDeleteAutomationRunParams extends WBrandAgentWorkspaceTarget {
  runId: string;
}
