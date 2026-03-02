import { createContext } from "react";

export const BoutUuidContext = createContext<string | null>(null);

export const ServerOffsetContext = createContext(0);
