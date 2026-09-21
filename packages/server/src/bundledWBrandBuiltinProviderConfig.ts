import { materializeWBrandBuiltinProviderConfig } from "@wbrand/services/node";

declare const __WBRAND_BUILTIN_PROVIDER_CONFIG_JSON__: string | undefined;

interface MaterializeBundledWBrandBuiltinProviderConfigOptions {
  readonly environmentConfigRoot: string;
  readonly content: string;
}

/** 返回构建时嵌入远端 Server 的 WBrand Built-in Provider Config。 */
export function readBundledWBrandBuiltinProviderConfig(): string {
  if (typeof __WBRAND_BUILTIN_PROVIDER_CONFIG_JSON__ !== "string") {
    throw new Error("当前构建未嵌入 WBrand Built-in Provider Config");
  }
  return __WBRAND_BUILTIN_PROVIDER_CONFIG_JSON__;
}

/**
 * 将 WBrand Built-in Config 原子物化到所属环境的固定资源副本。
 * 升级前退出旧进程；不保留按内容 hash 增长的历史文件。
 */
export async function materializeBundledWBrandBuiltinProviderConfig(
  options: MaterializeBundledWBrandBuiltinProviderConfigOptions,
): Promise<string> {
  return materializeWBrandBuiltinProviderConfig(options);
}
