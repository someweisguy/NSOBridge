type Callback = (d: unknown, ts: Date) => void;

const all_callbacks: Map<string, Callback[]> = new Map<string, Callback[]>();
const socket: WebSocket = new WebSocket(`ws://${window.location.host}/ws/`);

function handle_connection_event(connect: boolean) {
  const now = new Date();
  const callbacks = all_callbacks.get("connection");
  if (callbacks != undefined) {
    for (const callback of callbacks) {
      callback(connect, now);
    }
  }
}

socket.onopen = () => handle_connection_event(true);
socket.onclose = () => handle_connection_event(false);
socket.onmessage = (event: MessageEvent<string>) => {
  const now = new Date();
  const payload = JSON.parse(event.data) as { type: string; data: unknown };
  const callbacks: Callback[] | undefined = all_callbacks.get(payload.type);
  if (callbacks != undefined) {
    for (const callback of callbacks) {
      callback(payload.data, now);
    }
  }
};

export function register_callback(type: string, cb: Callback): void {
  let callbacks: Callback[] | undefined = all_callbacks.get(type);
  if (callbacks === undefined) {
    all_callbacks.set(type, []);
    callbacks = all_callbacks.get(type)!;
  }
  callbacks.push(cb);
}
