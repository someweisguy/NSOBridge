import genericRequest from "./request";

let timedelta = 0;

export default function adjustServerTime(dateLike: Date | string): Date {
  const date = new Date(dateLike);
  return new Date(date.getTime() - timedelta);
}

export function getServerTimedelta(): number {
  return timedelta;
}

async function clockSynchronize(): Promise<{ offset: number; rtt: number }> {
  // Send the synchronization request
  const start: Date = new Date();
  const message = await genericRequest<{ t1: string; t2: string }>(
    "/serverSync",
    "GET"
  );
  const stop: Date = new Date();

  // Compute the time difference between client and server
  // See: https://en.wikipedia.org/wiki/Network_Time_Protocol#Clock_synchronization_algorithm
  const t: number[] = [
    start.getTime(),
    new Date(message.data.t1).getTime(),
    new Date(message.data.t2).getTime(),
    stop.getTime(),
  ];

  const offset: number = (t[1] - t[0] + (t[3] - t[2])) / 2;
  const rtt: number = t[3] - t[0] - (t[2] - t[1]);
  return { offset, rtt };
}

async function calculateClockOffset(iterations: number = 5): Promise<number> {
  let rtt: number = Number.MAX_VALUE;
  let offset: number = 0;

  for (let i = 0; i < iterations; ++i) {
    const { offset: currentOffset, rtt: currentRtt } = await clockSynchronize();
    if (currentRtt < rtt) {
      rtt = currentRtt;
      offset = currentOffset;
    }
  }

  return offset;
}

const iterations: number = 5;
calculateClockOffset(iterations).then((offset: number) => {
  timedelta = offset;
  setInterval(async () => {
    timedelta = await calculateClockOffset(iterations);
  }, 1000 * 15);
});
