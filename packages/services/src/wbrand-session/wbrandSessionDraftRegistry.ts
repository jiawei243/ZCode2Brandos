import type { WBrandSessionStateSnapshot } from "@wbrand/shared";
import type {
  WBrandSessionWorkspaceTarget,
  WBrandTaskTarget,
} from "#src/wbrand-session/wbrandSession.js";

function getWorkspaceKey(target: WBrandSessionWorkspaceTarget): string {
  return target.workspaceIdentity?.trim() || target.workspacePath;
}

function getSessionScopedKey(target: WBrandTaskTarget): string {
  return `${getWorkspaceKey(target)}\0${target.sessionId}`;
}

export function createWBrandDeferredDraftRegistry() {
  const sessionKeys = new Set<string>();

  return {
    remember(params: WBrandSessionWorkspaceTarget, snapshot: WBrandSessionStateSnapshot): void {
      sessionKeys.add(
        getSessionScopedKey({
          workspacePath: snapshot.session.workspace.workspacePath,
          workspaceIdentity:
            snapshot.session.workspace.workspaceIdentity ?? params.workspaceIdentity,
          sessionId: snapshot.session.sessionId,
        }),
      );
    },

    has(target: WBrandTaskTarget): boolean {
      return sessionKeys.has(getSessionScopedKey(target));
    },

    forget(target: WBrandTaskTarget): void {
      sessionKeys.delete(getSessionScopedKey(target));
    },
  };
}
