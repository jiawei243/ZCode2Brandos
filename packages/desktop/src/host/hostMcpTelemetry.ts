import type { IDisposable } from "@wbrand/rpc";
import type { IWBrandAgentService } from "@wbrand/services";
import type { ProcessResourceRuntimeSurface } from "@wbrand/shared";
import { HostResponseTypes } from "@wbrand/shared";

interface RegisterHostMcpTelemetryOptions {
  agentService: Pick<IWBrandAgentService, "onDynamicMcpTelemetry">;
  postMessage(message: unknown): void;
  runtimeSurface: ProcessResourceRuntimeSurface;
}

export function registerHostMcpTelemetry(options: RegisterHostMcpTelemetryOptions): IDisposable {
  return options.agentService.onDynamicMcpTelemetry()((event) => {
    try {
      options.postMessage({
        type: HostResponseTypes.McpTelemetry,
        runtimeSurface: options.runtimeSurface,
        event,
      });
    } catch {
      // main 已退出或 IPC 不可用时只丢当前遥测，不影响 MCP 生命周期。
    }
  });
}
