interface ScoreViewProps {
  period: number;
  jam: number;
  jamCounts: number[];
}

export default function JamNumView({ period, jam, jamCounts }: ScoreViewProps) {
  let displayPeriod = period;
  let displayJam = jam;

  // Overtime Jams should be considered a continuation of the second half
  if (displayPeriod >= 2) {
    displayPeriod = 1;
    displayJam += jamCounts[1];
  }

  return (
    <div className="flex justify-evenly items-baseline gap-3 m-4">
      <div className="w-full text-3xl text-right">P{displayPeriod + 1}</div>
      <div className="w-full text-3xl text-left">J{displayJam + 1}</div>
    </div>
  );
}
