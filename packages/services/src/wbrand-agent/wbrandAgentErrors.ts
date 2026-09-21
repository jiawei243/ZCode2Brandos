// 原始 -32602 文案来自旧 Agent schema，跨 RPC 后 UI 不能靠易变字符串识别能力缺失。
// ChannelClient 会保留 error.code，因此用稳定 code 驱动设置页停止 status-only 轮询。
export const WBRAND_AGENT_MCP_STATUS_MODE_UNSUPPORTED_ERROR_CODE =
  "WBRAND_AGENT_MCP_STATUS_MODE_UNSUPPORTED";

export class WBrandAgentMcpStatusModeUnsupportedError extends Error {
  readonly code = WBRAND_AGENT_MCP_STATUS_MODE_UNSUPPORTED_ERROR_CODE;

  constructor() {
    super("The connected WBrand Agent does not support MCP status-only refresh");
    this.name = "WBrandAgentMcpStatusModeUnsupportedError";
  }
}

export function isWBrandAgentMcpStatusModeUnsupportedError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  return (error as { code?: unknown }).code === WBRAND_AGENT_MCP_STATUS_MODE_UNSUPPORTED_ERROR_CODE;
}
