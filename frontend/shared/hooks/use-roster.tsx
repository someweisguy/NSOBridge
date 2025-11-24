import { getRosters, Roster } from "@/shared/types/rosters";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useRoster(rosterId: number): Roster {
  const { data } = useSuspenseQuery<Roster[], unknown, Roster>({
    queryKey: Roster.generateKey(rosterId),
    queryFn: () => getRosters([rosterId]),
    select: (rosters: Roster[]) => {
      // Only cache one item despite getRosters() returning multiple results
      return rosters[0];
    },
  });

  return data;
}
