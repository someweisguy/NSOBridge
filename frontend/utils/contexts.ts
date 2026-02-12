import { Bout, Team } from "@/lib/game/bouts";
import { Jam, TeamJam } from "@/lib/game/jams";
import { Ruleset } from "@/lib/game/ruleset";
import { createContext } from "react";

export const BoutContext = createContext<Bout | null>(null);

export const RulesetContext = createContext<Ruleset | null>(null);

export const JamContext = createContext<Jam | null>(null);

export const TeamContext = createContext<Team | null>(null);

export const TeamJamContext = createContext<TeamJam | null>(null);
