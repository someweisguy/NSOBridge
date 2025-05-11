export default function formatMilliseconds(
  millis: number,
  displayMillis = false,
  maxDisplayValue: "hours" | "minutes" | "seconds" = "seconds"
): string {
  let m = String(Math.floor((millis % 3600000) / 60000));
  let s = String(Math.floor((millis / 1000) % 60));

  let output: string;
  if (maxDisplayValue === "hours" || millis >= 3600000) {
    const h = Math.floor(millis / 3600000);
    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");
    output = `${h}:${m}:${s}`;
  } else if (maxDisplayValue === "minutes" || millis >= 60000) {
    s = String(s).padStart(2, "0");
    output = `${m}:${s}`;
  } else {
    output = s;
  }

  // Render tenths of a seconds
  if (displayMillis) {
    const ds = String(Math.floor((millis % 1000) / 100)).padStart(1, "0");
    output += `.${ds}`;
  }

  return output;
}
