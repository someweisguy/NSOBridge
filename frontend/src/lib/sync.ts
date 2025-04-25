import genericRequest from "./client";

let timedelta = 0;

export default function getServerTimedelta(): number {
  return timedelta;
}

async function syncServerTime(): Promise<number> {
  // Send the synchronization request
  const start: Date = new Date();
  const message = await genericRequest<{ t1: string; t2: string }>(
    "/serverSync",
    "GET"
  );
  const stop: Date = new Date();

  // Compute the time difference between client and server
  // See: https://magewell.com/blog/87/detail
  const t: number[] = [
    start.getTime(),
    new Date(message.data.t1).getTime(),
    new Date(message.data.t2).getTime(),
    stop.getTime(),
  ];

  const timedelta: number = (t[1] - t[0] + (t[3] - t[2])) / 2;
  return timedelta;
}

// Immediately sync the server time on load and re-sync regularly
syncServerTime().then((delta) => (timedelta = delta));
setInterval(() => {
  syncServerTime().then((delta) => (timedelta = delta));
}, 1000 * 10);
