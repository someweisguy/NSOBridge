type CallbackType<T = unknown> = (d: T) => void;

interface API {
  connect: boolean;
  updates: object[][];
  sync: ServerInfoType;
}

export interface ServerInfoType {
  process: Date;
  server: Date;
}

const allCallbacks = new Map<string, CallbackType[]>();
const allResolutions = new Map<string, CallbackType[]>();
const socket = new WebSocket(`ws://${window.location.host}/ws/`);

function handleSocketEvent<K extends keyof API>(
  payload: { type: K; data: API[K] },
  now?: Date
) {
  now ??= new Date();
  // Resolve all promises
  const resolutions: CallbackType[] | undefined = allResolutions.get(
    payload.type
  );
  if (resolutions !== undefined) {
    for (const resolution of resolutions) {
      resolution(payload.data);
    }
    allResolutions.delete(payload.type);
  }

  // Handle all callbacks
  const callbacks: CallbackType[] | undefined = allCallbacks.get(payload.type);
  if (callbacks !== undefined) {
    for (const callback of callbacks) {
      callback(payload.data);
    }
  }
}

socket.onopen = () => handleSocketEvent({ type: "connect", data: true });
socket.onclose = () => handleSocketEvent({ type: "connect", data: false });
socket.onmessage = <K extends keyof API>(event: MessageEvent<string>) => {
  const now = new Date();
  const payload = JSON.parse(event.data) as {
    type: K;
    data: API[K];
  };
  handleSocketEvent(payload, now);
};

export function registerWebSocketCallback<T extends keyof API>(
  type: T,
  cb: CallbackType<API[T]>
): void {
  let callbacks: CallbackType[] | undefined = allCallbacks.get(type);
  callbacks ??= [];
  callbacks.push(cb as unknown as CallbackType);

  allCallbacks.set(type, callbacks);
}

export function receiveWebSocketMessage<K extends keyof API>(
  type: K,
  timeout = 5000
): Promise<API[K]> {
  return new Promise((resolve, reject) => {
    let resolutions: CallbackType[] | undefined = allResolutions.get(type);
    resolutions ??= [];

    resolutions.push(resolve as CallbackType);
    allResolutions.set(type, resolutions);
    setTimeout(() => reject(new Error("WebSocket timed out")), timeout);
  });
}

export async function getServerInfo(): Promise<ServerInfoType> {
  // Wait until the WebSocket is connected
  if (socket.readyState !== WebSocket.OPEN) {
    const connected = await receiveWebSocketMessage("connect").catch(
      () => false
    );
    if (!connected) {
      throw new Error("Could not get server info (not connected)");
    }
  }

  socket.send(JSON.stringify({ process: new Date() }));
  const payload: ServerInfoType = await receiveWebSocketMessage("sync");
  payload.process = new Date(payload.process);
  payload.server = new Date(payload.server);
  return payload;
}
