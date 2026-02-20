import queryClient from "@/lib/cache";
import { Bout, getAllBouts } from "@/lib/game/bouts";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseGetAllBouts = (
  options?: Omit<SuspenseQueryOptions<Bout[]>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery(
    {
      queryKey: Bout.generateKey(),
      queryFn: () =>
        getAllBouts().then((bouts: Bout[]) => {
          for (const bout of bouts) {
            queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
          }
          return bouts;
        }),
      ...options,
    },
    queryClient,
  );
