import type { Event, IDisposable } from "@wbrand/rpc";
import type { WBrandProtocolMessage } from "@wbrand/shared";

export type WBrandProtocolTransportKind = "stdio" | "websocket" | "memory";

export interface WBrandProtocolTransportClosedEvent {
  code?: number | null;
  signal?: NodeJS.Signals | null;
  reason?: string;
}

export interface WBrandProtocolTransport extends IDisposable {
  readonly kind: WBrandProtocolTransportKind;
  readonly onMessage: Event<WBrandProtocolMessage>;
  readonly onClose: Event<WBrandProtocolTransportClosedEvent>;
  send(message: WBrandProtocolMessage): Promise<void>;
  disposeAndWait?(): Promise<void>;
}
