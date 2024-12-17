import { PropsWithChildren, ReactElement } from "react";

export default function Container({
  children,
}: PropsWithChildren): ReactElement {
  return <div className="p-2 m-1 rounded-lg bg-raisin-100">{children}</div>;
}
