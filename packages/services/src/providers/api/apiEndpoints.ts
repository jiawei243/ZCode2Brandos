import { buildRuntimeWBrandApiUrl, resolveZaiBusinessBaseUrl } from "@wbrand/shared";

export const WBRAND_CLIENT_SCENES_URL = buildRuntimeWBrandApiUrl(
  process.env,
  "/api/v1/client/scenes",
);

export const ZAI_API_HOST = resolveZaiBusinessBaseUrl(process.env);
