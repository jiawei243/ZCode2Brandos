export const WBRAND_BUILTIN_PROVIDER_CONFIG_FILE_ENV = "WBRAND_BUILTIN_PROVIDER_CONFIG_FILE";
export const WBRAND_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE_ENV =
  "WBRAND_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE";
export const WBRAND_PERSONAL_PROVIDER_CONFIG_FILE_ENV = "WBRAND_PERSONAL_PROVIDER_CONFIG_FILE";
export const PERSONAL_PROVIDER_CONFIG_FILE_NAME = "provider_config.json";

export interface NodeProviderRuntimePaths {
  readonly wbrandBuiltinFilePath: string;
  readonly personalFilePath: string;
}

export function createNodeProviderRuntimePathEnv(
  paths: NodeProviderRuntimePaths,
): Record<string, string> {
  return {
    [WBRAND_BUILTIN_PROVIDER_CONFIG_FILE_ENV]: paths.wbrandBuiltinFilePath,
    [WBRAND_PERSONAL_PROVIDER_CONFIG_FILE_ENV]: paths.personalFilePath,
  };
}

export function resolveNodeProviderRuntimePaths(
  env: Readonly<Record<string, string | undefined>>,
): NodeProviderRuntimePaths | null {
  const wbrandBuiltinFilePath = env[WBRAND_BUILTIN_PROVIDER_CONFIG_FILE_ENV]?.trim();
  const personalFilePath = env[WBRAND_PERSONAL_PROVIDER_CONFIG_FILE_ENV]?.trim();
  if (!wbrandBuiltinFilePath && !personalFilePath) return null;
  if (!wbrandBuiltinFilePath || !personalFilePath) {
    throw new Error("WBrand Built-in 与 Personal Provider Config 路径必须同时提供");
  }
  return Object.freeze({ wbrandBuiltinFilePath, personalFilePath });
}
