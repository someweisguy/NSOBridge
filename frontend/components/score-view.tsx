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
    <div className="flex flex-row flex-nowrap justify-end gap-2 w-full size-full">
      <h1 className="content-center min-w-fit max-w-1/2 font-bold text-9xl text-right grow">
        {boutScore + scoreOffset}
      </h1>
      <h2 className="content-center ps-4 text-7xl text-left shrink-0 basis-1/3">
        {jamScore}
      </h2>
    </div>
  );
}
