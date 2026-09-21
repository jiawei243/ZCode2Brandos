import {
  collectVisibleWBrandBackgroundTaskControlItems,
  getWBrandBackgroundTaskControlItemElapsedMs,
  isActiveWBrandBackgroundTaskControlItem,
  parseWBrandBackgroundTaskControlItems,
  type WBrandBackgroundTaskControlItem,
  type WBrandBackgroundTaskControlStatus,
} from "./background-task-controls.js";

export type WBrandBackgroundBashJobStatus = WBrandBackgroundTaskControlStatus;
export type WBrandBackgroundBashJob = WBrandBackgroundTaskControlItem & {
  taskKind: "bash";
};

export function parseWBrandBackgroundBashJobs(value: unknown): WBrandBackgroundBashJob[] {
  return parseWBrandBackgroundTaskControlItems(value).filter(isBackgroundBashJob);
}

export function isActiveWBrandBackgroundBashJob(job: WBrandBackgroundBashJob): boolean {
  return isActiveWBrandBackgroundTaskControlItem(job);
}

export function getWBrandBackgroundBashJobElapsedMs(
  job: WBrandBackgroundBashJob,
  now = Date.now(),
): number {
  return getWBrandBackgroundTaskControlItemElapsedMs(job, now);
}

export function collectVisibleWBrandBackgroundBashJobs(
  jobs: readonly WBrandBackgroundBashJob[],
  now = Date.now(),
  thresholdMs = 30_000,
): Array<WBrandBackgroundBashJob & { elapsedMs: number }> {
  return collectVisibleWBrandBackgroundTaskControlItems(jobs, now, thresholdMs) as Array<
    WBrandBackgroundBashJob & { elapsedMs: number }
  >;
}

function isBackgroundBashJob(job: WBrandBackgroundTaskControlItem): job is WBrandBackgroundBashJob {
  return job.taskKind === "bash";
}
