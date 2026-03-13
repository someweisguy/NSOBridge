/**
 * A regex which matches against Date strings using the ISO 8601 standard.
 */
const dateTimeExpression = new RegExp(
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3,6}[Z]?/,
);

/**
 * Convert an object into a Date. If the object is a date-like string, it is converted
 * into a Date and returned. If the object is anything else, the object is returned.
 *
 * This function is used for deserializing game objects.
 *
 * @param value an object which could potentially be a Date string.
 * @returns
 */
export function dateReviver<T>(_: string, value: T): T | Date {
  if (typeof value === "string" && dateTimeExpression.test(value)) {
    const date: Date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}
