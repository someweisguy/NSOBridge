import { Team } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Ruleset } from "@/lib/game/ruleset";
import { createContext } from "react";

export const RulesetContext = createContext<Ruleset | null>(null);

export const JamContext = createContext<Jam | null>(null);

export const TeamContext = createContext<Team | null>(null);
