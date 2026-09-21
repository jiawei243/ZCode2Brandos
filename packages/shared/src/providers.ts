import { z } from "zod";

/**
 * WBrand agent 提供方的单一真源。
 *
 * 类型 WBrandProvider、运行时 schema wbrandProviderSchema 都从这里派生,
 * 避免各处内联 z.enum([...]) 副本随新增/删除 provider 漂移。
 * 本模块只依赖 zod(叶子),可被 validation / wbrand-protocol 等无环引用。
 */
const WBRAND_PROVIDERS = ["glm"] as const;

export const wbrandProviderSchema = z.enum(WBRAND_PROVIDERS);

export type WBrandProvider = (typeof WBRAND_PROVIDERS)[number];
