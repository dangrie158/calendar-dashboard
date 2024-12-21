import React, { useEffect, useState } from "react";
import "./time.css";

export default function Time({ dim }: { dim: boolean }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={["time", dim ? "t-dim" : ""].join(" ")}>
            {currentTime.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            })}
        </div>
    );
}
