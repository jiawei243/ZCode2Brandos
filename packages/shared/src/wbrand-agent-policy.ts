import { z } from "zod";
import type { CommandAgentSource } from "./command-types.js";
import type { WBrandProvider } from "./wbrand-task-types-core.js";

export const WBRAND_AGENT_PROVIDER = "glm" satisfies WBrandProvider;
export const WBRAND_AGENT_PROVIDER_LABEL = "WBrand Agent";
export const WBRAND_COMMAND_AGENT_SOURCE = "wbrandAgent" satisfies CommandAgentSource;

export const wbrandAgentProviderSchema = z.literal(WBRAND_AGENT_PROVIDER);

export const WBRAND_COMMAND_AGENT_SOURCES = [
  WBRAND_COMMAND_AGENT_SOURCE,
] as const satisfies readonly CommandAgentSource[];

export function normalizeAgentProviderToWBrandAgent(
  _provider?: WBrandProvider | null,
): WBrandProvider {
  return WBRAND_AGENT_PROVIDER;
}

export function isWBrandAgentProvider(
  provider: WBrandProvider | null | undefined,
): provider is typeof WBRAND_AGENT_PROVIDER {
  return provider === WBRAND_AGENT_PROVIDER;
}
