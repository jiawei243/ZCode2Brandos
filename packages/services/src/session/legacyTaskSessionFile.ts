import type { WBrandSessionFile, WBrandTaskMeta } from "@wbrand/shared";
import {
  wbrandSessionFileSchema,
  wbrandTaskMetaSchema,
  wbrandTaskModeSchema,
} from "@wbrand/shared";

export type LegacyTaskSessionFile = Omit<WBrandSessionFile, "meta"> & {
  meta: Omit<WBrandTaskMeta, "mode"> & { mode?: WBrandTaskMeta["mode"] };
};

const legacyTaskSessionFileSchema = wbrandSessionFileSchema.extend({
  // Claude 原生迁移会按清洗路径删除 meta.mode。
  // legacy snapshot 读取/写入仍要校验其它必需字段，但不能再强制把被过滤字段补回文件。
  meta: wbrandTaskMetaSchema.extend({
    mode: wbrandTaskModeSchema.optional(),
  }),
});

export function parseLegacyTaskSessionFile(input: unknown): LegacyTaskSessionFile {
  return legacyTaskSessionFileSchema.parse(input);
}

export function safeParseLegacyTaskSessionFile(input: unknown) {
  return legacyTaskSessionFileSchema.safeParse(input);
}
