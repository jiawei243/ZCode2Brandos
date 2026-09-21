// 平台能力面收敛：设置页「插件管理」的薄服务接口。
//
// 背景：pluginManagementStore / usePluginUninstall 过去直接注入 IWBrandAgentService，
// UI 层因此散布 13 个 plugins/* 旧协议词的消费点。收敛为独立薄 service 后，UI 只依赖
// 本接口；plugins/* 词表的 host 侧消费点收拢到 pluginManagementService 一处（插件的
// 事实源在 wbrand-cli 进程，服务实现仍经 agent 协议往返——plugins 词表的收口归属
// 插件能力面自身的协议演进，不在会话 v4 词表范围内）。
// 注意与既有 IPluginsService（已 retired 的 marketplace pluginStore 通道）区分：
// 那套接口按 pluginName+marketplace 寻址且方法语义过时，不复用避免签名冲突。
import type { Event } from "@wbrand/rpc";
import type {
  WBrandPluginOperationProgressNotification,
  WBrandPluginsConfigureResult,
  WBrandPluginsCancelOperationResult,
  WBrandPluginsDescribeResult,
  WBrandPluginsInstallResult,
  WBrandPluginsListResult,
  WBrandPluginsMarketplaceMutationResult,
  WBrandPluginsOverviewResult,
  WBrandPluginsReferenceCatalogResult,
  WBrandPluginsRestoreBuiltinResult,
  WBrandPluginsSetEnabledResult,
  WBrandPluginsUninstallResult,
  WBrandPluginsValidateResult,
} from "@wbrand/shared";
import { ServiceChannels } from "@wbrand/shared";
import { createServiceDescriptor } from "../descriptors.js";
import type {
  WBrandAgentAddPluginMarketplaceParams,
  WBrandAgentConfigurePluginParams,
  WBrandAgentCancelPluginOperationParams,
  WBrandAgentDescribePluginParams,
  WBrandAgentInstallPluginParams,
  WBrandAgentPluginReferenceCatalogParams,
  WBrandAgentResolveSuggestedPluginReferenceParams,
  WBrandAgentResetPluginConfigParams,
  WBrandAgentPluginViewParams,
  WBrandAgentRemovePluginMarketplaceParams,
  WBrandAgentRestoreBuiltinPluginParams,
  WBrandAgentSetPluginEnabledParams,
  WBrandAgentUninstallPluginParams,
  WBrandAgentUpdatePluginMarketplaceParams,
  WBrandAgentUpdatePluginParams,
  WBrandAgentValidatePluginParams,
} from "../wbrand-agent/wbrandAgentPluginParams.js";

export interface IPluginManagementService {
  listPlugins(params: WBrandAgentPluginViewParams): Promise<WBrandPluginsListResult>;
  /**
   * Plugin 对话引用 catalog：
   * 带 sessionId → session-owned 冻结 catalog；不带 → workspace 当前 catalog。
   * 实现路由到 workspace 级 agent client，不走插件管理独立进程。
   */
  getPluginReferenceCatalog(
    params: WBrandAgentPluginReferenceCatalogParams,
  ): Promise<WBrandPluginsReferenceCatalogResult>;
  resolveSuggestedPluginReference(
    params: WBrandAgentResolveSuggestedPluginReferenceParams,
  ): Promise<import("@wbrand/shared").WBrandPluginsResolveSuggestedReferenceResult>;
  onDynamicPluginOperationProgress(
    operationId: string,
  ): Event<WBrandPluginOperationProgressNotification>;
  getPluginsOverview(params: WBrandAgentPluginViewParams): Promise<WBrandPluginsOverviewResult>;
  addPluginMarketplace(
    params: WBrandAgentAddPluginMarketplaceParams,
  ): Promise<WBrandPluginsMarketplaceMutationResult>;
  removePluginMarketplace(
    params: WBrandAgentRemovePluginMarketplaceParams,
  ): Promise<WBrandPluginsMarketplaceMutationResult>;
  updatePluginMarketplace(
    params: WBrandAgentUpdatePluginMarketplaceParams,
  ): Promise<WBrandPluginsMarketplaceMutationResult>;
  installPlugin(params: WBrandAgentInstallPluginParams): Promise<WBrandPluginsInstallResult>;
  cancelPluginOperation(
    params: WBrandAgentCancelPluginOperationParams,
  ): Promise<WBrandPluginsCancelOperationResult>;
  uninstallPlugin(params: WBrandAgentUninstallPluginParams): Promise<WBrandPluginsUninstallResult>;
  updatePlugin(params: WBrandAgentUpdatePluginParams): Promise<WBrandPluginsInstallResult>;
  restoreBuiltinPlugin(
    params: WBrandAgentRestoreBuiltinPluginParams,
  ): Promise<WBrandPluginsRestoreBuiltinResult>;
  configurePlugin(params: WBrandAgentConfigurePluginParams): Promise<WBrandPluginsConfigureResult>;
  resetPluginConfig(
    params: WBrandAgentResetPluginConfigParams,
  ): Promise<WBrandPluginsConfigureResult>;
  validatePlugin(params: WBrandAgentValidatePluginParams): Promise<WBrandPluginsValidateResult>;
  describePlugin(params: WBrandAgentDescribePluginParams): Promise<WBrandPluginsDescribeResult>;
  setPluginEnabled(
    params: WBrandAgentSetPluginEnabledParams,
  ): Promise<WBrandPluginsSetEnabledResult>;
}

export const IPluginManagementService = createServiceDescriptor<IPluginManagementService>(
  ServiceChannels.PluginManagement,
);
