import type { WBrandSessionStateSnapshot } from "@wbrand/shared";
import { createServiceLogger } from "#src/logger/serviceLogger.js";
import { repairImportedClaudeSessionSnapshot } from "#src/session/claude-native/importedClaudeHistoryRepair.js";
import type { IWBrandAgentService } from "#src/wbrand-agent/wbrandAgent.js";
import type {
  WBrandSessionReadParams,
  WBrandSessionResumeParams,
} from "#src/wbrand-session/wbrandSession.js";

const logger = createServiceLogger("wbrand-session-service");

export async function repairEmptyImportedClaudeSessionSnapshot(params: {
  agentService: IWBrandAgentService;
  snapshot: WBrandSessionStateSnapshot;
  target: WBrandSessionResumeParams | WBrandSessionReadParams;
}): Promise<WBrandSessionStateSnapshot> {
  const repaired = await repairImportedClaudeSessionSnapshot({
    snapshot: params.snapshot,
    target: {
      workspacePath: params.target.workspacePath,
      workspaceIdentity: params.target.workspaceIdentity,
      taskId: params.target.sessionId,
      ...("mcpServers" in params.target && params.target.mcpServers
        ? { mcpServers: params.target.mcpServers }
        : {}),
    },
    createSession: (input) => params.agentService.createSession(input),
    onRepair: (history) => {
      logger.warn(
        undefined,
        `[wbrand-session-service] Claude 导入 session 历史异常，按 ${history.source} 回填 taskId=${params.target.sessionId}`,
      );
    },
  });
  return repaired ?? params.snapshot;
}
