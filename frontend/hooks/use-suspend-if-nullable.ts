import { useState } from "react";

/**
 * Suspend the React component if the desired value is nullable.
 *
 * This hook uses the React Suspense feature to suspend the current component if
 * the argument passed to the function is null or undefined.
 *
 * This function also acts as a TypeScript type predicate.
 *
 * @param value The value to check is null or undefined.
 */
export default function useSuspendIfNullable<T>(
  value: T | undefined,
): asserts value is NonNullable<T> {
  const [promise, setPromise] = useState<Promise<unknown> | null>(null);

  if (value == null && promise == null) {
    // TODO: do we need state here?
    const promise = new Promise(() => null);
    setPromise(promise);

    // React Suspense works by throwing Promises
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw promise;
  } else if (value != null && promise != null) {
    setPromise(null);
  }
}
