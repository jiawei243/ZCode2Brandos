import { ServiceChannels } from "@wbrand/shared";
import type {
  TraceId,
  WBrandAgentMcpServer,
  WBrandDeliveryKind,
  WBrandMessageWithParts,
  ModelSelection,
  WBrandPermissionRequestParams,
  WBrandUserInputRequestParams,
  WBrandUserInputResponse,
  WBrandSessionInfo,
  WBrandSessionImportHistory,
  WBrandSessionEvent,
  WBrandSessionMode,
  WBrandSessionPersistence,
  WBrandSessionStateSnapshot,
  WBrandStateUpdatedNotification,
  WBrandWorkspacePresentation,
} from "@wbrand/shared";
import { createServiceDescriptor } from "#src/descriptors.js";

export interface WBrandSessionWorkspaceTarget {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
}

export type WBrandSessionReadWorkspacePresentationParams = WBrandSessionWorkspaceTarget;

export interface WBrandTaskTarget extends WBrandSessionWorkspaceTarget {
  sessionId: string;
}

export interface WBrandSessionCreateParams extends WBrandSessionWorkspaceTarget {
  /** 仅导入事务使用的预分配 ID；普通新会话继续由 Agent 分配。 */
  sessionId?: string;
  sessionTraceId?: TraceId;
  parentSessionId?: string;
  mode?: WBrandSessionMode;
  model?: ModelSelection;
  persistence?: WBrandSessionPersistence;
  thoughtLevel?: string;
  mcpServers?: WBrandAgentMcpServer[];
  importedHistory?: WBrandSessionImportHistory;
}

export interface WBrandSessionResumeParams extends WBrandTaskTarget {
  model?: ModelSelection;
  thoughtLevel?: string;
  mcpServers?: WBrandAgentMcpServer[];
  /**
   * 默认广播 resume 得到的历史快照，并让 shadow 订阅请求初始 snapshot。
   * 续聊发送前的 runtime 预恢复会关闭它，避免旧终态快照覆盖本地已开始的新输入运行态。
   */
  broadcastSnapshot?: boolean;
}

export interface WBrandSessionListParams extends WBrandSessionWorkspaceTarget {
  includeArchived?: boolean;
  limit?: number;
}

export interface WBrandSessionReadParams extends WBrandTaskTarget {
  deliveryKind?: WBrandDeliveryKind;
  messageLimit?: number;
  afterSeq?: number;
}

export interface WBrandSessionMessagesParams extends WBrandTaskTarget {
  afterMessageId?: string;
  limit?: number;
}

export interface WBrandSessionEventsParams extends WBrandTaskTarget {
  afterSeq?: number;
  limit?: number;
}

export interface WBrandSessionSetModelParams extends WBrandTaskTarget {
  model: ModelSelection;
  expectedRevision?: number;
  persistAsWorkspaceLastUsed?: boolean;
}

export interface WBrandSessionSetThoughtLevelParams extends WBrandTaskTarget {
  thoughtLevel?: string;
  expectedRevision?: number;
  persistAsWorkspaceLastUsed?: boolean;
}

export interface WBrandSessionSetModeParams extends WBrandTaskTarget {
  mode: WBrandSessionMode;
  expectedRevision?: number;
}

export interface WBrandSessionSubscribeParams extends WBrandTaskTarget {
  deliveryKind: WBrandDeliveryKind;
  afterSeq?: number;
  includeSnapshot?: boolean;
  eventCoalescing?: {
    mode: "background-summary";
    intervalMs?: number;
  };
}

export type WBrandSessionServiceEvent =
  | { type: "session.event"; event: WBrandSessionEvent }
  | { type: "state.updated"; notification: WBrandStateUpdatedNotification }
  | { type: "permission.request"; request: WBrandPermissionRequestParams }
  | { type: "userInput.request"; request: WBrandUserInputRequestParams }
  | {
      type: "userInput.response";
      requestId: string;
      response: WBrandUserInputResponse;
    }
  | { type: "snapshot"; snapshot: WBrandSessionStateSnapshot };

export interface WBrandSessionInitializeResult {
  available: boolean;
  workspaceKey: string;
  protocolName?: string;
  protocolVersion?: number;
  transportKind?: "stdio" | "websocket";
  reason?: string;
  reasonCode?: "provider_not_ready";
}

export interface WBrandSessionWorkspaceRuntimeIdentity {
  generation: number;
  identity: string;
  processId?: number;
  workspaceKey: string;
}

export interface IWBrandSessionService {
  initializeWorkspace(params: WBrandSessionWorkspaceTarget): Promise<WBrandSessionInitializeResult>;
  getWorkspaceRuntimeIdentity(
    params: WBrandSessionWorkspaceTarget,
  ): Promise<WBrandSessionWorkspaceRuntimeIdentity>;
  readWorkspacePresentation(
    params: WBrandSessionReadWorkspacePresentationParams,
  ): Promise<WBrandWorkspacePresentation>;
  createSession(params: WBrandSessionCreateParams): Promise<WBrandSessionStateSnapshot>;
  resumeSession(params: WBrandSessionResumeParams): Promise<WBrandSessionStateSnapshot>;
  listSessions(params: WBrandSessionListParams): Promise<WBrandSessionInfo[]>;
  readSession(params: WBrandSessionReadParams): Promise<WBrandSessionStateSnapshot>;
  readSessionMessages(params: WBrandSessionMessagesParams): Promise<WBrandMessageWithParts[]>;
  readSessionEvents(params: WBrandSessionEventsParams): Promise<WBrandSessionEvent[]>;
  promoteDeferredDraftSession(params: WBrandTaskTarget): Promise<void>;
  closeSession(params: WBrandTaskTarget): Promise<void>;
  closeDeferredDraftSession(params: WBrandTaskTarget): Promise<boolean>;
  setModel(params: WBrandSessionSetModelParams): Promise<WBrandSessionStateSnapshot>;
  setThoughtLevel(params: WBrandSessionSetThoughtLevelParams): Promise<WBrandSessionStateSnapshot>;
  setMode(params: WBrandSessionSetModeParams): Promise<WBrandSessionStateSnapshot>;
  // renderer 订阅面走 agentService 的 conversation/sessions-index 帧通道。
}

export const IWBrandSessionService = createServiceDescriptor<IWBrandSessionService>(
  ServiceChannels.WBrandSession,
);
