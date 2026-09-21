import { createLocalServices, getAppConfigDir } from "@wbrand/services/node";
import {
  materializeBundledWBrandBuiltinProviderConfig,
  readBundledWBrandBuiltinProviderConfig,
} from "./bundledWBrandBuiltinProviderConfig.js";
import { createHttpServer } from "./http.js";

async function main(): Promise<void> {
  const wbrandBuiltinProviderConfigFilePath = await materializeBundledWBrandBuiltinProviderConfig({
    environmentConfigRoot: getAppConfigDir(),
    content: readBundledWBrandBuiltinProviderConfig(),
  });
  const port = Number(process.env["PORT"]) || 3030;
  const host =
    process.env["WBRAND_SERVER_HOST"]?.trim() || process.env["HOST"]?.trim() || undefined;
  const staticRoot = process.env["WBRAND_WEB_STATIC_ROOT"]?.trim() || undefined;
  const authToken = process.env["WBRAND_SERVER_AUTH_TOKEN"]?.trim() || undefined;
  const services = createLocalServices({
    wbrandBuiltinProviderConfigFilePath,
    providerProvisioningTargetEnabled: Boolean(authToken),
  });

  createHttpServer(services, port, {
    ...(host ? { host } : {}),
    ...(staticRoot ? { staticRoot, spaFallback: true } : {}),
    ...(authToken ? { authToken, authRequired: true } : {}),
  });
}

void main().catch((error: unknown) => {
  console.error("[wbrand-server:http] startup failed", error);
  process.exitCode = 1;
});
