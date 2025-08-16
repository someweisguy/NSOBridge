interface ScoreViewProps {
  period: number;
  jam: number;
}

export default function JamNumView({ period, jam }: ScoreViewProps) {
  return (
    <div className="flex justify-evenly items-baseline gap-3 m-4">
      <div className="w-full text-3xl text-right">P{period + 1}</div>
      <div className="w-full text-3xl text-left">J{jam + 1}</div>
    </div>
  );
}
