import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Ruleset } from "@/types/game";
import { createContext } from "react";

export const BoutContext = createContext<Bout | null>(null);

export const JamContext = createContext<Jam | null>(null);

export const RulesetContext = createContext<Ruleset | null>(null);
