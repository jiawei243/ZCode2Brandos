import { WBRAND_VERSION, type WBrandEnv } from "@wbrand/shared";

declare const __WBRAND_CDN_BASE_URL__: string | undefined;
const DEFAULT_CDN_BASE_URL = "https://cdn-zcode.z.ai";

export interface ResolveRemoteCdnOptions {
  env?: WBrandEnv;
  locale?: string;
  timeZone?: string;
  overrideBaseUrl?: string;
  version?: string;
  now?: Date;
}

function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("CDN URL must use http or https");
  return value.replace(/\/+$/, "");
}

export function resolveRemoteCdnBaseUrls(options: ResolveRemoteCdnOptions = {}): string[] {
  const override = options.overrideBaseUrl?.trim();
  if (override) return [normalizeBaseUrl(override)];
  const baseUrl =
    process.env.WBRAND_CDN_BASE_URL?.trim() ||
    (typeof __WBRAND_CDN_BASE_URL__ === "undefined" ? "" : __WBRAND_CDN_BASE_URL__) ||
    DEFAULT_CDN_BASE_URL;
  return [
    `${normalizeBaseUrl(baseUrl)}/wbrand/electron/releases/${options.version ?? WBRAND_VERSION}`,
  ];
}
