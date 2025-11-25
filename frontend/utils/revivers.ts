export function dateReviver<T>(_: string, value: T): T | Date {
  if (typeof value === "string") {
    const date: Date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}
