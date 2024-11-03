import { useContext } from "react";
import { BoutContext } from "../App";


export default function ScoreboardOperator() {
    const boutId: string = useContext(BoutContext);

    return (
        <>
            <p>{boutId}</p>
        </>
    );
}