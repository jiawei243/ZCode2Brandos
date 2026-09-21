import {
  ProviderConfigService,
  type ProviderConfigLayerSnapshot,
  type ProviderConfigLayerUpdate,
} from "@wbrand/provider";
import { NodeWBrandBuiltinProviderConfigSource } from "./wbrand-builtin-provider-config-source.js";
import {
  EndpointScopedWBrandBuiltinSource,
  type EndpointScopedWBrandBuiltinSourceOptions,
} from "./endpoint-scoped-wbrand-builtin-source.js";
import {
  WBrandBuiltinRemoteSynchronizer,
  type WBrandBuiltinRemoteSynchronizerOptions,
  type WBrandBuiltinRefreshResult,
} from "./wbrand-builtin-remote-synchronizer.js";
import {
  NodePersonalProviderConfigRepository,
  type PersonalProviderConfigRecoveryEvent,
} from "./personal-provider-config-repository.js";

export interface NodeProviderConfigRuntimeOptions {
  readonly wbrandBuiltinFilePath: string;
  readonly wbrandBuiltinActiveFilePath?: string;
  readonly wbrandBuiltinRemote?: Omit<WBrandBuiltinRemoteSynchronizerOptions, "source">;
  readonly wbrandBuiltinEnvironment?: Omit<
    EndpointScopedWBrandBuiltinSourceOptions,
    "bundledFilePath"
  >;
  readonly onWBrandBuiltinRefreshError?: (error: unknown) => void;
  readonly onPersonalConfigRecovery?: (event: PersonalProviderConfigRecoveryEvent) => void;
  readonly onPersonalConfigPollingError?: (error: unknown) => void;
  readonly personalFilePath: string;
  readonly personalPollingIntervalMs?: number | false;
  readonly importLegacy?: (
    wbrandBuiltin: ProviderConfigLayerSnapshot,
  ) => Promise<ProviderConfigLayerUpdate | null>;
  readonly watch?: boolean;
}

/** 组装一个 Node.js 进程内共享的 WBrand Built-in/Personal Config 运行边界。 */
export class NodeProviderConfigRuntime {
  readonly configService: ProviderConfigService;
  readonly #wbrandBuiltinSource:
    | NodeWBrandBuiltinProviderConfigSource
    | EndpointScopedWBrandBuiltinSource;
  readonly #personalRepository: NodePersonalProviderConfigRepository;
  readonly #remoteSynchronizer?: WBrandBuiltinRemoteSynchronizer;
  readonly #onRemoteRefreshError?: (error: unknown) => void;
  #startPromise: Promise<void> | null = null;
  #disposed = false;
  readonly #checkListeners = new Set<() => Promise<void>>();
  #checkTimer: ReturnType<typeof setInterval> | null = null;
  #checkInFlight: Promise<void> | null = null;

  constructor(options: NodeProviderConfigRuntimeOptions) {
    this.#wbrandBuiltinSource = options.wbrandBuiltinEnvironment
      ? new EndpointScopedWBrandBuiltinSource({
          bundledFilePath: options.wbrandBuiltinFilePath,
          ...options.wbrandBuiltinEnvironment,
        })
      : new NodeWBrandBuiltinProviderConfigSource({
          bundledFilePath: options.wbrandBuiltinFilePath,
          activeFilePath: options.wbrandBuiltinActiveFilePath,
          watch: options.watch,
        });
    this.#remoteSynchronizer =
      options.wbrandBuiltinRemote &&
      this.#wbrandBuiltinSource instanceof NodeWBrandBuiltinProviderConfigSource
        ? new WBrandBuiltinRemoteSynchronizer({
            source: this.#wbrandBuiltinSource,
            ...options.wbrandBuiltinRemote,
          })
        : undefined;
    this.#onRemoteRefreshError = options.onWBrandBuiltinRefreshError;
    this.#personalRepository = new NodePersonalProviderConfigRepository({
      filePath: options.personalFilePath,
      onRecovery: options.onPersonalConfigRecovery,
      onPollingError: options.onPersonalConfigPollingError,
      pollingIntervalMs: options.personalPollingIntervalMs,
      ...(options.importLegacy
        ? {
            importLegacy: async () => options.importLegacy!(await this.#wbrandBuiltinSource.read()),
          }
        : {}),
    });
    this.configService = new ProviderConfigService({
      wbrandBuiltinSource: this.#wbrandBuiltinSource,
      personalRepository: this.#personalRepository,
    });
  }

  resolveWBrandBuiltinActiveFilePath(): Promise<string> {
    return this.#wbrandBuiltinSource instanceof NodeWBrandBuiltinProviderConfigSource
      ? Promise.resolve(this.#wbrandBuiltinSource.activeFilePath)
      : this.#wbrandBuiltinSource.resolveActiveFilePath();
  }

  get personalRepository(): import("@wbrand/provider").PersonalProviderConfigRepository {
    return this.#personalRepository;
  }

  /** Environment 同一周期检查中恢复未对齐依赖，不被下载 TTL 或失败挡住。 */
  onDidCheckWBrandBuiltin(listener: () => Promise<void>): () => void {
    this.#checkListeners.add(listener);
    return () => this.#checkListeners.delete(listener);
  }

  start(): Promise<void> {
    if (this.#disposed) throw new Error("NodeProviderConfigRuntime 已 dispose");
    if (this.#startPromise) return this.#startPromise;
    const startPromise = this.configService.read().then(() => {
      if (this.#disposed) return;
      void this.#checkBackground();
      // Managed Worker 无下载配置也无恢复 owner，不建立周期任务。
      if (
        this.#remoteSynchronizer ||
        this.#wbrandBuiltinSource instanceof EndpointScopedWBrandBuiltinSource ||
        this.#checkListeners.size > 0
      ) {
        this.#checkTimer = setInterval(() => {
          void this.#checkBackground();
        }, 60_000);
        this.#checkTimer.unref?.();
      }
    });
    this.#startPromise = startPromise;
    void startPromise.catch(() => {
      if (this.#startPromise === startPromise) this.#startPromise = null;
    });
    return startPromise;
  }

  refreshWBrandBuiltin(options?: {
    readonly force?: boolean;
  }): Promise<WBrandBuiltinRefreshResult> {
    if (this.#disposed) return Promise.resolve("disposed");
    if (this.#wbrandBuiltinSource instanceof EndpointScopedWBrandBuiltinSource) {
      return this.#wbrandBuiltinSource.refresh(options);
    }
    return this.#remoteSynchronizer?.refresh(options) ?? Promise.resolve("skipped");
  }

  #checkBackground(): Promise<void> {
    if (this.#disposed) return Promise.resolve();
    if (this.#checkInFlight) return this.#checkInFlight;
    const check = Promise.allSettled([
      this.refreshWBrandBuiltin(),
      ...[...this.#checkListeners].map((listener) => Promise.resolve().then(listener)),
    ])
      .then((results) => {
        if (this.#disposed) return;
        for (const result of results)
          if (result.status === "rejected") this.#onRemoteRefreshError?.(result.reason);
      })
      .finally(() => {
        if (this.#checkInFlight === check) this.#checkInFlight = null;
      });
    this.#checkInFlight = check;
    return check;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#checkTimer) clearInterval(this.#checkTimer);
    this.#checkTimer = null;
    this.#checkListeners.clear();
    this.#remoteSynchronizer?.dispose();
    this.configService.dispose();
    this.#personalRepository.dispose();
    this.#wbrandBuiltinSource.dispose();
  }
}

export function createNodeProviderConfigRuntime(
  options: NodeProviderConfigRuntimeOptions,
): NodeProviderConfigRuntime {
  return new NodeProviderConfigRuntime(options);
}
