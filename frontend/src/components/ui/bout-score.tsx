export default function BoutScore({
  gameScore,
  jamScore,
}: {
  gameScore: number;
  jamScore: number;
}) {
  return (
    <div className="flex flex-row items-end gap-1 p-2">
      <span className="font-bold text-right w-34 text-7xl"> {gameScore} </span>
      <span className="w-12 text-4xl font-bold text-center"> {jamScore} </span>
    </div>
  );
}
