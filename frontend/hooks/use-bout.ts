import queryClient from "@/lib/cache";
import { Bout, getAllBouts, getBout } from "@/lib/game/bouts";
import { QueryOptions, SuspenseQueryOptions } from "@/types/hooks";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseAllBouts = (options?: SuspenseQueryOptions<Bout[]>) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(),
    queryFn: () =>
      getAllBouts().then((bouts: Bout[]) => {
        for (const bout of bouts) {
          queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
        }
        return bouts;
      }),
    ...options,
  });

export const useBout = <T = null>(
  uuid: string,
  options?: QueryOptions<Bout | T>,
) =>
  useQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });

export const useSuspenseBout = (
  uuid: string,
  options?: SuspenseQueryOptions<Bout>,
) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });
