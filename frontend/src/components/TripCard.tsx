interface TripCardProps {
  key?: number;
  tripNum: number;
  points: number | null
}

export default function TripCard({ tripNum, points }: TripCardProps) {
  return (
    <button
      className="h-16 w-14 flex flex-col overflow-hidden border border-slate rounded-md mx-1 my-1 text-center"
      onClick={() => console.log("click")}
    >
      <div className="bg-slate-100 w-full h-1/3 text-center border-b text-xs italic">
        Trip {tripNum + 1}
      </div>
      <div className="h-full content-center text-lg font-semibold">
        {points ?? ""}
      </div>
    </button>
  );
}
