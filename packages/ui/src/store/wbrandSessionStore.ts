/**
 * WBrand session UI 状态 store
 *
 * 一个 tab 对应一个 workspace，所以聊天相关状态也必须按 workspace 分桶保存。
 * 这样切换标签页时，当前任务、输入中的草稿态和初始化状态才不会互相串台。
 */
import { create } from "zustand";
import { shouldExposeE2EStoreBridge } from "@/lib/e2eStoreBridge.js";
import { type WBrandSessionStoreState } from "./wbrandSessionStoreTypes.js";
import { getWorkspaceState } from "./wbrandSessionStoreSelectors.js";
import { createNavigationSlice } from "./wbrandSessionStoreNavigation.js";
import { createTaskSlice } from "./wbrandSessionStoreTaskSlice.js";
import { createWorkspaceSlice } from "./wbrandSessionStoreWorkspaceSlice.js";
import { uiMemoryDiagnosticsRegistry } from "@/lib/memoryDiagnostics.js";

export const useWBrandSessionStore = create<WBrandSessionStoreState>()((set, get) => ({
  workspaces: {},
  ...createNavigationSlice(set, get),
  ...createWorkspaceSlice(set),
  ...createTaskSlice(set),
  getWorkspaceState: (workspacePath: string, workspaceIdentity?: string) =>
    getWorkspaceState(get(), workspacePath, workspaceIdentity),
}));

type WBrandSessionStoreE2EBridge = typeof useWBrandSessionStore;

declare global {
  interface Window {
    __wbrandSessionStoreE2E?: WBrandSessionStoreE2EBridge;
  }
}

if (shouldExposeE2EStoreBridge()) {
  // E2E 诊断入口必须由 WDIO 显式打开，不能复用 WBRAND_ENV=test，避免产品测试环境暴露可变全局 store。
  window.__wbrandSessionStoreE2E = useWBrandSessionStore;
}

// ────────────────────────────────────────────
// Re-exports: 保持外部 `from '@/store/wbrandSessionStore'` 的导入路径继续工作
// ────────────────────────────────────────────
export * from "./wbrandSessionStoreTypes.js";
export * from "./wbrandSessionStoreSelectors.js";
// Re-export navigation types used externally:
export type {
  TaskNavigationHistory,
  TaskNavEntry,
  WorkspaceNavEntry,
} from "@/lib/taskNavigationHistory.js";

// 内存诊断计数器：workspace 桶全仓无删除路径，先落日志。
uiMemoryDiagnosticsRegistry.register("sessionStore", () => ({
  workspaces: Object.keys(useWBrandSessionStore.getState().workspaces).length,
}));
