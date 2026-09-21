import type { WBrandBackgroundTaskControlItem } from "./background-task-controls.js";

export function mergeWBrandBackgroundTaskControlItems(
  current: readonly WBrandBackgroundTaskControlItem[],
  updates: readonly WBrandBackgroundTaskControlItem[],
): WBrandBackgroundTaskControlItem[] {
  const jobsById = new Map(current.map((job) => [job.jobId, job] as const));
  for (const job of updates) {
    jobsById.set(job.jobId, job);
  }
  return Array.from(jobsById.values());
}
