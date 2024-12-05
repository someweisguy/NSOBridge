export default function CurrentJam({
  periodNum,
  jamNum,
}: {
  periodNum: number;
  jamNum: number;
}) {
  return (
    <button className="flex-shrink-0 px-3 py-2 m-2 text-xl font-semibold rounded-full min-size-fit bg-neutral-200 ring-1 ring-neutral-300">
      P{periodNum + 1} J{jamNum + 1}
    </button>
  );
}
