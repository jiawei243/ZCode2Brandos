export interface HelloMessage {
  type: "wbrand-hello";
  version: string;
  platform: string;
  arch: string;
  pid: number;
}

export interface HelloAckMessage {
  type: "wbrand-hello-ack";
  version: string;
  clientId: string;
}
