import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutContext } from "@/utils/contexts";
import { PropsWithChildren } from "react";

interface BoutProviderProps extends PropsWithChildren {
  boutUuid: string;
}

export default function BoutProvider({
  boutUuid,
  children,
}: BoutProviderProps) {
  const { data: bout } = useSuspenseBout(boutUuid);
  return <BoutContext value={bout}>{children}</BoutContext>;
}
