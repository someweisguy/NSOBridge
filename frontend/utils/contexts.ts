import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/types/game";
import { createContext } from "react";

export const BoutContext = createContext<Bout | null>(null);

export const JamContext = createContext<Jam | null>(null);
