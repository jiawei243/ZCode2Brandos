import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { WBrandStdioTapDevState } from "@wbrand/shared";
import { getAppConfigDir } from "#src/paths.js";
import { isEffectiveDevelopmentNodeEnv } from "#src/runtime-tools/nodeEnv.js";

interface WBrandStdioTapStateFile {
  enabled?: boolean;
}

function isWBrandStdioTapDevVisible(): boolean {
  return isEffectiveDevelopmentNodeEnv();
}

function getWBrandStdioTapDevDir(): string {
  return join(getAppConfigDir(), "dev");
}

export function getWBrandStdioTapDevLogDir(): string {
  return join(getWBrandStdioTapDevDir(), "stdio-traffic");
}

function getWBrandStdioTapDevStatePath(): string {
  return join(getWBrandStdioTapDevDir(), "wbrand-stdio-tap.json");
}

function readStateFile(path: string): WBrandStdioTapStateFile {
  if (!existsSync(path)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as WBrandStdioTapStateFile) : {};
  } catch {
    return {};
  }
}

export function readWBrandStdioTapDevState(): WBrandStdioTapDevState {
  const visible = isWBrandStdioTapDevVisible();
  const statePath = getWBrandStdioTapDevStatePath();
  const fileState = readStateFile(statePath);
  return {
    enabled: visible && fileState.enabled === true,
    visible,
    logDir: getWBrandStdioTapDevLogDir(),
    statePath,
  };
}

export function setWBrandStdioTapDevEnabled(enabled: boolean): WBrandStdioTapDevState {
  const visible = isWBrandStdioTapDevVisible();
  const statePath = getWBrandStdioTapDevStatePath();
  mkdirSync(getWBrandStdioTapDevDir(), { recursive: true });
  writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        // 开发态 stdio 抓包是高频原始协议帧，只能通过显式开关写旁路文件，避免误进生产日志。
        enabled: visible && enabled,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  return readWBrandStdioTapDevState();
}
