const callbacks: Map<string, (d: unknown, ts: Date) => void> = new Map();
const socket: WebSocket = new WebSocket(`ws://${window.location.host}/ws/`);

function handle_connection_event(connect: boolean) {
  const now = new Date();
  const callback = callbacks.get("connection");
  if (callback != undefined) {
    callback(connect, now);
  }
}

socket.onopen = () => handle_connection_event(true);
socket.onclose = () => handle_connection_event(false);
socket.onmessage = (event: MessageEvent<string>) => {
  const now = new Date();
  const payload = JSON.parse(event.data) as { type: string; data: unknown };
  const callback = callbacks.get(payload.type);
  if (callback != undefined) {
    callback(payload.data, now);
  }
};

export function register_callback(
  type: string,
  cb: (d: any, ts: Date) => void
): void {
  callbacks.set(type, cb);
}

export function delete_callback(type: string): boolean {
  return callbacks.delete(type);
}
