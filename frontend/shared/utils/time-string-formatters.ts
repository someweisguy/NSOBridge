export default function defaultTimeStringFormatter(millis: number): string {
  const isNegative = millis < 0;
  millis = Math.abs(millis);
  let m = String(Math.floor((millis % 3600000) / 60000));
  let s = String(Math.floor((millis / 1000) % 60));

  let output: string;
  if (millis >= 3600000) {
    const h = Math.floor(millis / 3600000);
    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");
    output = `${h}:${m}:${s}`;
  } else if (millis >= 60000) {
    s = String(s).padStart(2, "0");
    output = `${m}:${s}`;
  } else {
    output = s;
  }

  // Render tenths of a seconds
  if (millis < 10000 && !isNegative) {
    const ds = String(Math.floor((millis % 1000) / 100)).padStart(1, "0");
    output += `.${ds}`;
  }

  // Render a negative sign
  if (isNegative) {
    output = "+" + output;
  }

  return output;
}
