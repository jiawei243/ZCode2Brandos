import { recordArmsCustomEventForE2E } from "@wbrand/ui";
import { DesktopCommandIds, buildLocalMediaPreviewUrl, type IPlatformService } from "@wbrand/shared";

import { desktopBrowserPlatformBridge } from "./desktopBrowserPlatformBridge.js";

export function createDesktopPlatform(options: {
  isLocalDevelopmentRuntime: boolean;
}): IPlatformService {
  return {
    canSelectFilePath: true,
    createLocalMediaPreviewUrl: buildLocalMediaPreviewUrl,
    isLocalDevelopmentRuntime: options.isLocalDevelopmentRuntime,
    selectDirectory: () => window.wbrand.selectDirectory(),
    selectFile: () => window.wbrand.selectFile(),
    selectFiles: () => window.wbrand.selectFiles?.() ?? Promise.resolve([]),
    createTempTextAttachment: (payload) => window.wbrand.createTempTextAttachment(payload),
    onRemoteConnectionLog: (handler) => window.wbrand.onRemoteConnectionLog(handler),
    onRemoteSessionClosed: (handler) => window.wbrand.onRemoteSessionClosed(handler),
    activateOrSetWorkspace: (path) =>
      window.wbrand.activateOrSetWorkspace?.(path) ?? Promise.resolve({ activated: false }),
    connectRemote: (remoteOptions, requestId, context) =>
      window.wbrand.connectRemote(remoteOptions, requestId, context),
    cancelPendingRemoteConnection: (requestId) =>
      window.wbrand.cancelPendingRemoteConnection?.(requestId) ?? Promise.resolve(),
    bindRemoteWorkspaceSessionContext: (context) =>
      window.wbrand.bindRemoteWorkspaceSessionContext?.(context) ?? Promise.resolve(),
    disposeRemoteSession: (sessionId) => window.wbrand.disposeRemoteSession(sessionId),
    isDockerAvailable: () => window.wbrand.isDockerAvailable(),
    listWSLDistros: () => window.wbrand.listWSLDistros(),
    listDockerContainers: () => window.wbrand.listDockerContainers(),
    listSSHConfigAliases: () => window.wbrand.listSSHConfigAliases(),
    loadMcpFromUserDirectory: (payload) => window.wbrand.loadMcpFromUserDirectory(payload),
    saveMcpToUserDirectory: (payload) => window.wbrand.saveMcpToUserDirectory(payload),
    migrateLegacyCommonMcp: (payload) => window.wbrand.migrateLegacyCommonMcp(payload),
    openExternal: (url) => window.wbrand.openExternal(url),
    openFeedback: () => window.wbrand.executeDesktopCommand(DesktopCommandIds.OpenFeedback),
    openCommunity: () => window.wbrand.executeDesktopCommand(DesktopCommandIds.OpenCommunity),
    canOpenCommunity: (locale) => window.wbrand.canOpenCommunity(locale),
    openInFileManager: (path) => window.wbrand.openInFileManager(path),
    openExternalFile: (path) => window.wbrand.openExternalFile(path),
    openCuaPermissionOnboarding: window.wbrand.openCuaPermissionOnboarding
      ? (permissionOptions) =>
          window.wbrand.openCuaPermissionOnboarding?.(permissionOptions) ??
          Promise.resolve({ success: false, error: "not_supported" })
      : undefined,
    prepareCuaHelperPermissionDrag: window.wbrand.prepareCuaHelperPermissionDrag
      ? () =>
          window.wbrand.prepareCuaHelperPermissionDrag?.() ??
          Promise.resolve({ success: false, error: "not_supported" })
      : undefined,
    startCuaHelperPermissionDrag: window.wbrand.startCuaHelperPermissionDrag
      ? () => window.wbrand.startCuaHelperPermissionDrag?.()
      : undefined,
    registerOAuthState: (payload) => window.wbrand.registerOAuthState(payload),
    onOAuthCallback: (callback) => window.wbrand.onOAuthCallback(callback),
    onPaymentCallback: (callback) => window.wbrand.onPaymentCallback(callback),
    onShareImport: (callback) => window.wbrand.onShareImport?.(callback) ?? (() => {}),
    notifyRendererReady: () => window.wbrand.notifyRendererReady(),
    reportTelemetryEvent: (payload) => window.wbrand.reportTelemetryEvent(payload),
    reportArmsCustomEvent: (payload) => {
      recordArmsCustomEventForE2E(payload);
      return window.wbrand.reportArmsCustomEvent(payload);
    },
    getRendererActionTraceConfig: window.wbrand.getRendererActionTraceConfig
      ? () => window.wbrand.getRendererActionTraceConfig!()
      : undefined,
    onRendererActionTraceConfigChanged: window.wbrand.onRendererActionTraceConfigChanged
      ? (callback) => window.wbrand.onRendererActionTraceConfigChanged!(callback)
      : undefined,
    reportLocalTtftBatch: (batch) => window.wbrand.reportLocalTtftBatch(batch),
    reportRendererActionTraceBatch: window.wbrand.reportRendererActionTraceBatch
      ? (batch) => window.wbrand.reportRendererActionTraceBatch!(batch)
      : undefined,
    reportRendererHeapSample: window.wbrand.reportRendererHeapSample
      ? (sample) => window.wbrand.reportRendererHeapSample!(sample)
      : undefined,
    showTaskNotification: (payload) => window.wbrand.showTaskNotification(payload),
    syncWindowTabs: (paths) => window.wbrand.syncWindowTabs(paths),
    syncWindowUnreadCount: (count) => window.wbrand.syncWindowUnreadCount(count),
    syncActiveTaskSession: (sessionId) => window.wbrand.syncActiveTaskSession(sessionId),
    syncAppSettings: (patch) => window.wbrand.syncAppSettings?.(patch),
    setShortcutRecordingActive: (active) => window.wbrand.setShortcutRecordingActive?.(active),
    onFocusTab: (handler) => window.wbrand.onFocusTab(handler),
    onNewTab: (handler) => window.wbrand.onNewTab(handler),
    onCloseActiveContextRequest: (handler) =>
      window.wbrand.onCloseActiveContextRequest?.(handler) ?? (() => {}),
    onOpenBrowserUrl: (handler) => window.wbrand.onOpenBrowserUrl?.(handler) ?? (() => {}),
    onBrowserViewScreenshotSurfacePrepare: (handler) =>
      window.wbrand.onBrowserViewScreenshotSurfacePrepare?.(handler) ?? (() => {}),
    onBrowserViewScreenshotSurfaceRelease: (handler) =>
      window.wbrand.onBrowserViewScreenshotSurfaceRelease?.(handler) ?? (() => {}),
    browserViewScreenshotSurfaceReady: (payload) =>
      window.wbrand.browserViewScreenshotSurfaceReady?.(payload),
    ...desktopBrowserPlatformBridge,
    onNewTask: (handler) => window.wbrand.onNewTask(handler),
    onOpenWorkspace: (handler) => {
      // 开发态或升级后的旧窗口可能仍运行未暴露 onOpenWorkspace 的 preload，
      // renderer 直接调用会在启动时崩溃。这里和 activateOrSetWorkspace 一样做兼容兜底，
      // 缺少该 bridge 时只禁用原生菜单回调，不影响应用继续打开。
      return window.wbrand.onOpenWorkspace?.(handler) ?? (() => {});
    },
    onOpenWorkspacePath: (handler) => window.wbrand.onOpenWorkspacePath?.(handler) ?? (() => {}),
    onOpenFeedbackDialog: (handler) => window.wbrand.onOpenFeedbackDialog?.(handler) ?? (() => {}),
    onOpenTicketsPanel: (handler) => window.wbrand.onOpenTicketsPanel?.(handler) ?? (() => {}),
    onWindowFullscreenChanged: (handler) => window.wbrand.onWindowFullscreenChanged(handler),
    getDesktopWindowChromeState: window.wbrand.getDesktopWindowChromeState
      ? () => window.wbrand.getDesktopWindowChromeState!()
      : undefined,
    onDesktopWindowChromeStateChanged: window.wbrand.onDesktopWindowChromeStateChanged
      ? (handler) => window.wbrand.onDesktopWindowChromeStateChanged!(handler)
      : undefined,
    getWindowControlsOverlayMetrics: () => window.wbrand.getWindowControlsOverlayMetrics?.() ?? null,
    onWindowControlsOverlayChanged: (handler) =>
      window.wbrand.onWindowControlsOverlayChanged?.(handler) ?? (() => {}),
    getDesktopZoomLevel: () =>
      window.wbrand.getDesktopZoomLevel?.() ?? Promise.resolve({ zoomLevel: 0 }),
    onDesktopZoomLevelChanged: (handler) =>
      window.wbrand.onDesktopZoomLevelChanged?.(handler) ?? (() => {}),
    onTaskNotificationClick: (handler) => window.wbrand.onTaskNotificationClick(handler),
    exportLogs: () => window.wbrand.exportLogs(),
    captureWindowScreenshot: () =>
      window.wbrand.captureWindowScreenshot?.() ?? Promise.resolve(null),
    onUpdateReady: (callback) => window.wbrand.onUpdateReady(callback),
    onUpdateCheckResult: (callback) => window.wbrand.onUpdateCheckResult(callback),
    onUpdateStateChanged: (callback) => window.wbrand.onUpdateStateChanged?.(callback) ?? (() => {}),
    getUpdateState: () =>
      window.wbrand.getUpdateState?.() ?? Promise.resolve({ kind: "idle", enabled: true }),
    downloadUpdate: () => window.wbrand.downloadUpdate?.() ?? Promise.resolve(),
    cancelUpdateDownload: () => window.wbrand.cancelUpdateDownload?.() ?? Promise.resolve(),
    openUpdateStatusWindow: () => window.wbrand.openUpdateStatusWindow?.() ?? Promise.resolve(),
    getAutoUpdatePreferences: () =>
      window.wbrand.getAutoUpdatePreferences?.() ??
      Promise.resolve({ autoDownloadAndInstallUpdates: false }),
    setAutoDownloadAndInstallUpdates: (enabled) =>
      window.wbrand.setAutoDownloadAndInstallUpdates?.(enabled) ?? Promise.resolve(),
    getDesktopSessionActivity: () =>
      window.wbrand.getDesktopSessionActivity?.() ??
      Promise.resolve({ runningAgentSessionCount: 0 }),
    getWBrandStdioTapDevState: () =>
      window.wbrand.getWBrandStdioTapDevState?.() ??
      Promise.resolve({ enabled: false, visible: false, logDir: "", statePath: "" }),
    onSettingsChanged: (callback) => window.wbrand.onSettingsChanged?.(callback) ?? (() => {}),
    onApplicationLocaleChanged: (callback) =>
      window.wbrand.onApplicationLocaleChanged?.(callback) ?? (() => {}),
    onPostUpdateReleaseNotes: (callback) => window.wbrand.onPostUpdateReleaseNotes(callback),
    acknowledgePostUpdateReleaseNotes: (version) =>
      window.wbrand.acknowledgePostUpdateReleaseNotes(version),
    skipUpdateVersion: (version) => window.wbrand.skipUpdateVersion?.(version) ?? Promise.resolve(),
    quitAndInstallUpdate: () => window.wbrand.quitAndInstallUpdate(),
    getInstalledEditors: () => window.wbrand.getInstalledEditors(),
    getApplicationIcon: (bundleId) =>
      window.wbrand.getApplicationIcon?.(bundleId) ?? Promise.resolve(null),
    openInEditor: (editorId, path, editorOptions) =>
      window.wbrand.openInEditor(editorId, path, editorOptions),
    executeDesktopCommand: (command) => window.wbrand.executeDesktopCommand(command),
    setApplicationLocale: (locale) => window.wbrand.setApplicationLocale(locale),
    getSystemLocale: () =>
      window.wbrand.getSystemLocale?.() ??
      Promise.resolve(navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US"),
    setTitleBarTheme: (theme) => window.wbrand.setTitleBarTheme(theme),
    getDeviceId: () =>
      (window as Window & { __WBRAND_DEVICE_ID__?: string }).__WBRAND_DEVICE_ID__ ?? "",
  };
}
