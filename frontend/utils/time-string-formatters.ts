/**

Bout clock - count-down time until alarm
Jam clock - count-down time until alarm
lineup/timeout - count-up, time since start
ttd - count-down to timestamp
 */

const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;

const MILLIS_PER_DECISECOND = 10;

/**
 * Format a number of milliseconds and an optional alarm value into a time
 * string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @returns a formatted time string.
 */
export default function defaultTimeStringFormatter(
  milliseconds: number,
): string {
  const isNegative = milliseconds < 0;
  milliseconds = Math.abs(milliseconds);

  const hh = String(Math.floor(milliseconds / MILLIS_PER_HOUR)).padStart(
    2,
    "0",
  );
  const mm = String(
    Math.floor((milliseconds % MILLIS_PER_HOUR) / MILLIS_PER_MINUTE),
  ).padStart(2, "0");
  const ss = String(
    Math.floor((milliseconds % MILLIS_PER_MINUTE) / MILLIS_PER_SECOND),
  ).padStart(2, "0");

  let output = `${hh}:${mm}:${ss}`;

  // Omit the hours and minutes if those values are zeroes
  if (Number(hh) == 0) {
    output = output.slice(3);
    if (Number(mm) == 0) {
      output = output.slice(3);
    }
  }

  // Remove leading zeroes
  if (output.length > 0 && output.startsWith("0")) {
    output = output.slice(1);
  }

  // Render a negative sign
  if (isNegative) {
    output = "+" + output;
  }

  // Add a decimal point if there are less than 10 seconds remaining
  if (milliseconds < 10 * MILLIS_PER_SECOND) {
    const f = String(
      Math.floor((milliseconds % MILLIS_PER_SECOND) / MILLIS_PER_DECISECOND),
    ).padStart(2, "0");
    output = output + `.${f}`;
  }

  return output;
}

/**
 * Format a number of milliseconds and an optional alarm value into a Period
 * time string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @returns a formatted time string.
 */
export function periodTimeStringFormatter(milliseconds: number): string {
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
 * Format a number of milliseconds and an optional alarm value into a Lineup
 * time string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to
 * fire.
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
 * Format a number of milliseconds and an optional alarm value into a Jam time
 * string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to
 * fire.
 * @returns a formatted time string.
 */
export function jamTimeStringFormatter(milliseconds: number): string {
  return periodTimeStringFormatter(milliseconds);
}

/**
 * Format a number of milliseconds and an optional alarm value into a Timeout
 * time string. This is used for count-up and count-down timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to
 * fire.
 * @returns a formatted time string.
 */
export function timeoutTimeStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  return lineupTimeStringFormatter(milliseconds, alarm);
}

/**
 * Format a number of milliseconds and an optional alarm value into a time
 * string. This is used for time-to-derby timer displays.
 *
 * @param milliseconds the number of milliseconds to convert.
 * @param alarm the number of milliseconds that must be reached for the alarm to
 * fire.
 * @returns a formatted time string.
 */
export function timeToDerbyStringFormatter(
  milliseconds: number,
  alarm?: number,
): string {
  if (alarm) {
    // Automatically convert to a count-down
    milliseconds = alarm - milliseconds;
  }

  // TODO: this should be a count-down timer only

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
