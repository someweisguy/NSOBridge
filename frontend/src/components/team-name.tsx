import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import { HOME } from "@/lib/client/api/types";
import { useContext } from "react";

interface TeamNameProps {
  boutId?: string;
  team: number;
  useMnemonic?: boolean;
  defaultName?: [string, string];
}

const DEFAULT_NAMES: [string, string] = ["Home", "Away"];

export default function TeamName({
  boutId,
  team,
  useMnemonic = false,
}: TeamNameProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const teamName = useBout(boutId, (bout) => {
    const name: string = useMnemonic
      ? bout.teams[team].roster.mnemonic
      : bout.teams[team].roster.name;
    return name ? name : DEFAULT_NAMES[Number(team !== HOME)];
  });

  return (
    <div className="font-bold text-4xl text-center align-middle">
      {teamName}
    </div>
  );
}
