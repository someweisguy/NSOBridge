import { PropsWithChildren, ReactElement } from "react";

export default function JamTraverse({
  children,
}: PropsWithChildren): ReactElement {
  return (
    <div
      aria-hidden="false"
      className="flex-none transition rounded-md shadow-sm size-fit bg-amber-400 text-yellow-950 outline outline-1 outline-amber-500 hover:bg-amber-300"
    >
      <button className="p-2 px-3 size-full">{children}</button>
    </div>
  );
}
