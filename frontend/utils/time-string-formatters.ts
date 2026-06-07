/**
 * Format a number of milliseconds and an optional alarm value into a time string. This
 * is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to fire.
 * @returns a formatted time string.
 */
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

/**
 * Format a number of milliseconds and an optional alarm value into a Period time
 * string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to fire.
 * @returns a formatted time string.
 */
export function periodTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  if (alarm) {
    // Automatically convert to a count-down
    milliseconds = alarm - milliseconds;
  }

  const rawMilliseconds = milliseconds;
  milliseconds = milliseconds < 0 ? 0 : Math.abs(milliseconds);
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
  if (milliseconds < 10000 && rawMilliseconds >= -2000) {
    const ds = String(Math.floor((milliseconds % 1000) / 100)).padStart(1, "0");
    output += `.${ds}`;
  }

  return output;
}

/**
 * Format a number of milliseconds and an optional alarm value into a Lineup time
 * string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to fire.
 * @returns a formatted time string.
 */
export function lineupTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  if (alarm) {
    // Automatically convert to a count-down
    milliseconds = alarm - milliseconds;
  }

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

  return output;
}

/**
 * Format a number of milliseconds and an optional alarm value into a Jam time string.
 * This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to fire.
 * @returns a formatted time string.
 */
export function jamTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  return periodTimeStringFormatter(milliseconds, alarm);
}

/**
 * Format a number of milliseconds and an optional alarm value into a Timeout time
 * string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to fire.
 * @returns a formatted time string.
 */
export function timeoutTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  return lineupTimeStringFormatter(milliseconds, alarm);
}
