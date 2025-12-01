interface JammerStatusProps {
  lead: boolean;
  lost: boolean;
  starPass: boolean;
}

export default function JammerStatus({
  lead,
  lost,
  starPass,
}: JammerStatusProps) {
  if (starPass) {
    return <>SP</>;
  }

  if (lost) {
    return <>LO</>;
  }

  if (lead) {
    return <>LD</>;
  }

  return <></>;
}
