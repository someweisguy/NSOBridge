type CallbackType = (d: unknown) => void;

export interface ServerInfoType {
  process: Date;
  server: Date;
}

export const CONNECT_EVENT = "";
const allCallbacks = new Map<string, CallbackType[]>();
const allResolutions = new Map<string, CallbackType[]>();
const socket = new WebSocket(`ws://${window.location.host}/ws/`);

function handleSocketEvent<T = unknown>(
  payload: { type: string; data: T },
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

socket.onopen = () => handleSocketEvent({ type: CONNECT_EVENT, data: true });
socket.onclose = () => handleSocketEvent({ type: CONNECT_EVENT, data: false });
socket.onmessage = (event: MessageEvent<string>) => {
  const now = new Date();
  const payload = JSON.parse(event.data) as { type: string; data: unknown };
  handleSocketEvent(payload, now);
};

export function registerCallback<T = unknown>(
  type: string,
  cb: (d: T) => void
): void {
  let callbacks: CallbackType[] | undefined = allCallbacks.get(type);
  callbacks ??= [];
  callbacks.push(cb as CallbackType);

  allCallbacks.set(type, callbacks);
}

export function receiveMessage<T = unknown>(
  type: string,
  timeout = 5000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let resolutions: CallbackType[] | undefined = allResolutions.get(type);
    resolutions ??= [];

    resolutions.push(resolve as CallbackType);
    allResolutions.set(type, resolutions);
    setTimeout(() => reject(new Error("WebSocket timed out")), timeout);
  });
}

export async function getServerInfo(): Promise<ServerInfoType> {
  // Wait until the WebSocket is connected
  if (!socket.OPEN) {
    const connected = await receiveMessage<boolean>(CONNECT_EVENT).catch(
      () => false
    );
    if (!connected) {
      throw new Error("Could not get server info (not connected)");
    }
  }

  socket.send(JSON.stringify({ process: new Date() }));
  return await receiveMessage("sync");
}
