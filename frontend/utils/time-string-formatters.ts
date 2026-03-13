
export default function defaultTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  if (alarm) {
    // Automatically convert to a count-down
    milliseconds = alarm - milliseconds;
  }

  const isNegative = milliseconds < 0;
  milliseconds = Math.abs(milliseconds);
  let m = String(Math.floor((milliseconds % 3600000) / 60000));
  let s = String(Math.floor((milliseconds / 1000) % 60));

  let output: string;
  if (milliseconds >= 3600000) {
    const h = Math.floor(milliseconds / 3600000);
    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");
    output = `${h}:${m}:${s}`;
  } else if (milliseconds >= 60000) {
    s = String(s).padStart(2, "0");
    output = `${m}:${s}`;
  } else {
    output = s;
  }

  // Render tenths of a seconds
  if (milliseconds < 10000 && !isNegative) {
    const ds = String(Math.floor((milliseconds % 1000) / 100)).padStart(1, "0");
    output += `.${ds}`;
  }

  // Render a negative sign
  if (isNegative) {
    output = "+" + output;
  }

  return output;
}

export function periodTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  // TODO: Implement time string formatter
  return defaultTimeStringFormatter(milliseconds, alarm);
}

export function lineupTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  // TODO: Implement time string formatter
  return defaultTimeStringFormatter(milliseconds, alarm);
}

export function jamTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  // TODO: Implement time string formatter
  return defaultTimeStringFormatter(milliseconds, alarm);
}

export function timeoutTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  // TODO: Implement time string formatter
  return defaultTimeStringFormatter(milliseconds, alarm);
}
