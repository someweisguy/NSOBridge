import { ReactNode } from "react";

export default function Topbar(): ReactNode {
  return (
    <div className="container sticky top-0 flex flex-row items-center p-4 shadow-md place-content-start bg-slate-400 max-h-16">
      <img src="skate.svg" className="flex-initial h-full pl-2"></img>
      <div className="flex-none h-full px-6 place-content-center">
        <strong>NSO Bridge</strong>
      </div>
    </div>
  );
}
