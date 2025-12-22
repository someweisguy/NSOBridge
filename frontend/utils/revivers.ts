const dateTimeExpression = new RegExp(
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
);

export function dateReviver<T>(_: string, value: T): T | Date {
  if (typeof value === "string" && dateTimeExpression.test(value)) {
    const date: Date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}
