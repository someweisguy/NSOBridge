import { useInterface } from "../App.js"

export default function TimerComponent({}) {

    
    useInterface("getJamTimer", timerCallback);


    return (
        <h1>Hello world!</h1>
    );
}