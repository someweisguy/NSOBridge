import { PropsWithChildren, ReactElement } from "react";

export default function DeleteReveal({
  children
}: PropsWithChildren): ReactElement {
  return (
    <div className="relative grid group justify-items-center">
      <div className="z-10 transition hover:delay-500 group-hover:-translate-y-3/4">
        {children}
      </div>
      <div className="absolute text-red-800 bg-red-500 rounded-full shadow-md hover:bg-red-600 hover:text-red-900 bottom-1/4 size-7">
        <button className="justify-center align-middle size-full">X</button>
      </div>
    </div>
  );
}
