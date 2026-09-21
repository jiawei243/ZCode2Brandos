const WBRAND_PROCESS_PREFIX = "wbrand";
const MAX_PROCESS_NAME_SEGMENT_LENGTH = 24;

function sanitizeProcessNameSegment(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, MAX_PROCESS_NAME_SEGMENT_LENGTH);
}

function joinWBrandProcessName(...segments: Array<string | null | undefined>): string {
  const sanitizedSegments = segments
    .map((segment) => sanitizeProcessNameSegment(segment))
    .filter((segment): segment is string => Boolean(segment));
  return [WBRAND_PROCESS_PREFIX, ...sanitizedSegments].join("-");
}

function pickWorkspaceTag(workspacePath: string | null | undefined): string | undefined {
  const trimmedPath = workspacePath?.trim();
  if (!trimmedPath) {
    return undefined;
  }

  const parts = trimmedPath.split(/[\\/]+/).filter(Boolean);
  return parts.at(-1) ?? trimmedPath;
}

export function formatWBrandMainProcessName(): string {
  return joinWBrandProcessName("main");
}

export function formatWBrandGpuProcessName(): string {
  return joinWBrandProcessName("gpu");
}

export function formatWBrandHostProcessName(label?: string): string {
  return joinWBrandProcessName("host", label);
}

export function formatWBrandRendererProcessName(windowTitle?: string): string {
  const normalizedTitle = windowTitle?.trim();
  if (!normalizedTitle || normalizedTitle === "WBrand") {
    return joinWBrandProcessName("renderer", "main");
  }

  if (normalizedTitle === "Resource Manager") {
    return joinWBrandProcessName("renderer", "resource-manager");
  }

  const remoteWindowPrefix = "WBrand - ";
  if (normalizedTitle.startsWith(remoteWindowPrefix)) {
    return joinWBrandProcessName(
      "renderer",
      "remote",
      normalizedTitle.slice(remoteWindowPrefix.length),
    );
  }

  return joinWBrandProcessName("renderer", normalizedTitle);
}

export function formatWBrandAgentProcessName(provider: string, workspacePath?: string): string {
  return joinWBrandProcessName("agent", provider, pickWorkspaceTag(workspacePath));
}

export function formatWBrandUtilityProcessName(name?: string, type = "utility"): string {
  return joinWBrandProcessName(type, name);
}
