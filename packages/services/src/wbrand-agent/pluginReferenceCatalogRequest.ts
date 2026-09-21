import {
  wbrandProtocolMethods,
  wbrandPluginsReferenceCatalogResultSchema,
  type WBrandPluginsReferenceCatalogParams,
} from "@wbrand/shared";
import type { WBrandProtocolClient } from "#src/wbrand-agent/wbrandProtocolClient.js";

/** 旧协议严格校验响应；新展示字段走独立入口，只有 -32601 能证明旧 Agent 不支持。 */
export async function requestPluginReferenceCatalog(
  client: Pick<WBrandProtocolClient, "request">,
  params: WBrandPluginsReferenceCatalogParams,
) {
  try {
    return await client.request(
      wbrandProtocolMethods.pluginsReferenceCatalogWithCategory,
      params,
      wbrandPluginsReferenceCatalogResultSchema,
    );
  } catch (error) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === -32601))
      throw error;
    return client.request(
      wbrandProtocolMethods.pluginsReferenceCatalog,
      params,
      wbrandPluginsReferenceCatalogResultSchema,
    );
  }
}
