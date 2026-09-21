import type { WorkspacePurpose, WBrandTaskMeta } from "@wbrand/shared";

export type WBrandTaskListKind = "pinned" | "archived" | "timeline" | "active";
export type WBrandTaskListSortBy = "created" | "updated";

export interface WBrandTaskListWorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string;
  workspacePurpose?: WorkspacePurpose;
}

export interface WBrandTaskListQuery {
  kind: WBrandTaskListKind;
  workspaceScopes: WBrandTaskListWorkspaceScope[];
  sortBy: WBrandTaskListSortBy;
  search?: string;
  limit?: number;
}

export type WBrandTaskListItem = WBrandTaskMeta & {
  searchSnippet?: string;
  searchSnippets?: string[];
};

export interface WBrandTaskListResult {
  items: WBrandTaskListItem[];
  total: number;
  hasMore: boolean;
}

export type WBrandTaskGroupColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";

export interface WBrandTaskGroup {
  id: string;
  title: string;
  color: WBrandTaskGroupColor;
  createdAt: number;
  updatedAt: number;
}

export interface WBrandGroupedTaskRef {
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string;
}

export type WBrandGroupedTaskViewTopLevelNodeRef =
  | { type: "group"; groupId: string }
  | { type: "task"; task: WBrandGroupedTaskRef };

export type WBrandGroupedTaskViewNode =
  | {
      type: "group";
      group: WBrandTaskGroup;
      tasks: WBrandTaskListItem[];
      sortOrder?: number;
    }
  | {
      type: "task";
      task: WBrandTaskListItem;
      sortOrder?: number;
    };

export interface WBrandGroupedTaskView {
  nodes: WBrandGroupedTaskViewNode[];
}

export interface WBrandGroupedTaskViewQuery {
  workspaceScopes: WBrandTaskListWorkspaceScope[];
  includeAllWorkspaces?: boolean;
}

// ── grouped 原始结构（不 join tasks 表）──
// grouped 视图的任务数据源迁到 sessions-index 后，服务端只提供分组结构
// （task_groups / task_group_members / task_group_view_node_orders），
// 由客户端与 sessions-index 会话做 join。

/** 组成员引用（不含任务 meta；task 内容由 sessions-index 提供）。 */
export interface WBrandGroupedTaskViewStructureMember {
  groupId: string;
  /** 服务端口径 workspaceKey（resolveWorkspaceKey：identity ?? path），join 匹配键。 */
  workspaceKey: string;
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string;
  /** null = 尚未落 sort_order（新加入组）；客户端按 addedAt 降序补内存序。 */
  sortOrder: number | null;
  addedAt: number;
}

/** 顶层节点排序（task_group_view_node_orders，node_key 已解析为结构化引用）。 */
export type WBrandGroupedTaskViewStructureTopOrder =
  | { type: "group"; groupId: string; sortOrder: number }
  | { type: "task"; workspaceKey: string; taskId: string; sortOrder: number };

export interface WBrandGroupedTaskViewStructure {
  /** 已按 workspaceScopes 可见性过滤的 group（bootstrap workspace group 只在其 workspace 可见）。 */
  groups: WBrandTaskGroup[];
  /** 全量组成员（含不可见 group 的成员——顶层排除规则需要全量判断）。 */
  members: WBrandGroupedTaskViewStructureMember[];
  topLevelOrders: WBrandGroupedTaskViewStructureTopOrder[];
}

export interface WBrandGroupedTaskViewOrderInput {
  workspaceScopes: WBrandTaskListWorkspaceScope[];
  topLevelNodes: WBrandGroupedTaskViewTopLevelNodeRef[];
  groups: Array<{
    groupId: string;
    taskRefs: WBrandGroupedTaskRef[];
  }>;
}

export interface WBrandWorkspaceEventSubscriptionParams {
  workspacePath: string;
  workspaceIdentity?: string;
}
