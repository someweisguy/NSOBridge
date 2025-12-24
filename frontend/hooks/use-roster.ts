import { Roster } from "@/lib/game/rosters";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import getRoster from "../lib/game/rosters";

export const useSuspenseRoster = (rosterId: number) =>
  useSuspenseQuery<Roster>({
    queryKey: Roster.generateKey(rosterId),
    queryFn: () => getRoster(rosterId),
  });

export const useRoster = (rosterId: number) =>
  useQuery<Roster>({
    queryKey: Roster.generateKey(rosterId),
    queryFn: () => getRoster(rosterId),
  });
