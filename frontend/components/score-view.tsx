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
    <div className="flex flex-row content-center-safe gap-1 h-full">
      <h1 className="content-center min-w-fit max-w-1/2 text-7xl text-right grow shrink">
        {boutScore + scoreOffset}
      </h1>
      <h2 className="content-center ps-2 text-4xl text-left shrink-0">
        {jamScore}
      </h2>
    </div>
  );
}
