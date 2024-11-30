import { PropsWithChildren, ReactElement } from "react";

export default function CheckboxButton({
  children,
}: PropsWithChildren): ReactElement {
  return (
    <button className="flex items-center w-full p-2 m-4 rounded-md bg-slate-400 h-fit max-w-32">
      <span className="flex-1 text-start size-fit">{children}</span>
      &#9744;
    </button>
  );
}
