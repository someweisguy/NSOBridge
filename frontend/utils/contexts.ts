import { Bout } from "@/lib/game/bouts";
import { createContext } from "react";

// TODO: remove this context (and entire file)
export const BoutContext = createContext<Bout | null>(null);
