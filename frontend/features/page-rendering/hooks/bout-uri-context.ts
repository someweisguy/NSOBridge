import { BoutUri } from "@/types/query";
import { createContext, useContext } from "react";

export const BoutUriProvider = createContext<BoutUri | null>(null);

/**
 * Get the Bout URI provided as a context. Throws an error if no context was provided.
 *
 * @returns the Bout URI provided as a React Context.
 */
export const useBoutUriContext = (): BoutUri => {
  const boutUri: BoutUri | null = useContext(BoutUriProvider);
  if (boutUri == null) {
    throw new Error("No Bout URI context was provided.");
  }
  return boutUri;
};
