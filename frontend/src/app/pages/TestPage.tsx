import { useContext } from "react";
import { BoutContext } from "../../App";


export default function TestPage() {
  const boutId: string = useContext(BoutContext);

  return (
    <>
      {boutId} <br />
      First <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
      Hello <br /> hello <br /> hello <br /> hello <br />
    </>
  );
}
