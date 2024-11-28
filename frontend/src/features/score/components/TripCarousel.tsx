import { PropsWithChildren, ReactElement } from "react";
import NavButton from "./NavButton";

export default function TripCarousel({
  children,
}: PropsWithChildren): ReactElement {
  return (
    <div className="bg-slate-300">
      <div className="flex flex-row items-center flex-initial h-24 min-w-full p-2 px-12">
        <div className="z-20 translate-x-1/2">
          <NavButton direction="left" />
        </div>
        <div className="flex flex-row flex-1 gap-2 p-2 px-5 overflow-x-scroll overflow-y-hidden bg-white rounded-md shadow-inner size-full min-w-56 max-w-72 no-scrollbar">
          {children}
        </div>
        <div className="z-20 -translate-x-1/2">
          <NavButton direction="right" />
        </div>
        {/* TODO: add scroll to end button */}
      </div>
    </div>
  );
}
