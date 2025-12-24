import { Roster } from "@/lib/game/rosters";
import { useSuspenseQuery } from "@tanstack/react-query";
import getRoster from "../lib/game/rosters";

export const useSuspenseRoster = (rosterId: number) =>
  useSuspenseQuery<Roster, unknown, Roster>({
    queryKey: Roster.generateKey(rosterId),
    queryFn: () => getRoster(rosterId),
  });
