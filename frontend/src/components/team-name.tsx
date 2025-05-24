import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import { TeamString } from "@/lib/client/api/jam";
import { useContext } from "react";

interface TeamNameProps {
  boutId?: string;
  team: TeamString;
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
    const name: string = useMnemonic ? bout[team].mnemonic : bout[team].name;
    return name ? name : DEFAULT_NAMES[Number(team !== "home")];
  });

  return <div className="font-bold text-4xl text-center align-middle">{teamName}</div>;
}
