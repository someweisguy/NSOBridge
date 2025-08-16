interface ScoreViewProps {
  boutScore: number;
  scoreOffset: number;
  jamScore: number;
}

export default function ScoreView({
  boutScore,
  scoreOffset = 0,
  jamScore,
}: ScoreViewProps) {
  return (
    <div className="flex justify-evenly items-baseline gap-4 m-4">
      <div className="w-full font-bold text-7xl text-right">
        {boutScore + scoreOffset}
      </div>
      <div className="w-full text-4xl text-left">{jamScore}</div>
    </div>
  );
}
