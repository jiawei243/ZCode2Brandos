import { DEFAULT_WBRAND_ENDPOINT_ORIGIN } from "./wbrandEndpoint.js";

export const WBRAND_SOURCE_HEADERS = {
  "User-Agent": "WBrand/unknown",
  "HTTP-Referer": DEFAULT_WBRAND_ENDPOINT_ORIGIN,
  "X-Title": "Z Code@electron",
} as const;

export interface BuildWBrandSourceHeadersFromContextOptions {
  appVersion?: string;
  arch?: string;
  clientLanguage?: string;
  clientTimezone?: string;
  deviceMid?: string;
  endpointOrigin?: string;
  osVersion?: string;
  platform?: string;
  releaseChannel?: string;
  sourceTitle?: string;
}

export function normalizeWBrandSourceHeaderValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !/^[\x20-\x7e]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function buildWBrandSourceHeadersFromContext(
  options: BuildWBrandSourceHeadersFromContextOptions = {},
): Record<string, string> {
  const appVersion = normalizeWBrandSourceHeaderValue(options.appVersion);
  const arch = normalizeWBrandSourceHeaderValue(options.arch);
  const clientLanguage = normalizeWBrandSourceHeaderValue(options.clientLanguage) ?? "unknown";
  const clientTimezone = normalizeWBrandSourceHeaderValue(options.clientTimezone) ?? "unknown";
  const deviceMid = normalizeWBrandSourceHeaderValue(options.deviceMid);
  const endpointOrigin =
    normalizeWBrandSourceHeaderValue(options.endpointOrigin) ?? DEFAULT_WBRAND_ENDPOINT_ORIGIN;
  const osVersion = normalizeWBrandSourceHeaderValue(options.osVersion);
  const platform = normalizeWBrandSourceHeaderValue(options.platform);
  const releaseChannel = normalizeWBrandSourceHeaderValue(options.releaseChannel);
  const sourceTitle = normalizeWBrandSourceHeaderValue(options.sourceTitle) ?? "electron";

  return {
    ...WBRAND_SOURCE_HEADERS,
    "HTTP-Referer": endpointOrigin,
    "User-Agent": `WBrand/${appVersion ?? "unknown"}`,
    ...(appVersion ? { "X-WBrand-App-Version": appVersion } : {}),
    "X-Title": `Z Code@${sourceTitle}`,
    ...(platform && arch ? { "X-Platform": `${platform}-${arch}` } : {}),
    ...(releaseChannel ? { "X-Release-Channel": releaseChannel } : {}),
    "X-Client-Language": clientLanguage,
    "X-Client-Timezone": clientTimezone,
    ...(platform ? { "X-Os-Category": normalizeOsCategory(platform) } : {}),
    ...(osVersion ? { "X-Os-Version": osVersion } : {}),
    ...(deviceMid ? { "X-Device-Mid": deviceMid } : {}),
  };
}

function normalizeOsCategory(platform: string): string {
  switch (platform) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
}
