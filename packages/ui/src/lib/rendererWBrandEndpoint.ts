import {
  buildRuntimeWBrandEndpointUrls,
  WBRAND_ENV,
  type RuntimeWBrandEndpointEnv,
} from "@wbrand/shared";

interface RendererImportMetaEnv {
  VITE_WBRAND_BASE_URL?: string;
  VITE_WBRAND_ENDPOINT_ORIGIN?: string;
}

function readRendererImportMetaEnv(): RendererImportMetaEnv {
  return ((import.meta as ImportMeta & { env?: RendererImportMetaEnv }).env ??
    {}) as RendererImportMetaEnv;
}

function createRendererWBrandEndpointEnv(
  env: RendererImportMetaEnv = readRendererImportMetaEnv(),
): RuntimeWBrandEndpointEnv {
  return {
    WBRAND_ENV,
    // UI 侧的 wbrand-plan 占位 provider 以前只看 WBRAND_ENV，
    // 没有消费 Vite 注入的 base url，导致自定义测试域名时 renderer 和 host/service 可能不一致。
    WBRAND_BASE_URL: env.VITE_WBRAND_BASE_URL,
    WBRAND_ENDPOINT_ORIGIN: env.VITE_WBRAND_ENDPOINT_ORIGIN,
  };
}

export const RENDERER_WBRAND_ENDPOINT_URLS = buildRuntimeWBrandEndpointUrls(
  createRendererWBrandEndpointEnv(),
);
