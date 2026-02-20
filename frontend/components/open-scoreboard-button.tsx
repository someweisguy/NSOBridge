import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Button, ButtonProps } from "@mantine/core";
import { useContext } from "react";

export default function OpenScoreboardButton({
  ...props
}: Omit<ButtonProps, "onClick">) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("OpenScoreboardButton must be used within a BoutProvider");
  }
  return (
    <Button
      onClick={() => window.open("sb?boutUuid=" + bout.uuid, "_blank")}
      {...props}
    >
      Open Scoreboard
    </Button>
  );
}
