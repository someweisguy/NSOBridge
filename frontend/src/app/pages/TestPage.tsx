import { useContext } from "react";
import { BoutIdContext } from "../../contexts/bout-id";



export default function TestPage() {
  const boutId: string = useContext(BoutIdContext);

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
