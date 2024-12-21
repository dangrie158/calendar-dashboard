import React, { useCallback, useState } from "react";
import "./app.css";

import Wallpaper from "./wallpaper.tsx";
import Calendar from "./calendar.tsx";
import Weather from "./weather.tsx";
import Time from "./time.tsx";

const DIM_TIMEOUT = 1000 * 60 * 5;

export default function App() {
    const [dim, setDim] = useState(false);
    const [dimTimeout, setDimTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
    const resetDimTimeout = useCallback(() => {
        if (dimTimeout !== undefined) {
            clearTimeout(dimTimeout);
        }

        setDim(false);

        setDimTimeout(
            setTimeout(() => {
                const hour = new Date().getHours();
                if (hour >= 9 && hour < 18) {
                    resetDimTimeout();
                    return;
                }

                setDim(true);
            }, DIM_TIMEOUT)
        );
    }, [dimTimeout]);

    return (
        <div className="app">
            <div onClick={resetDimTimeout} className={["dim", dim ? "on" : "off"].join(" ")}></div>
            <Wallpaper />
            <Calendar resetDimTimeout={resetDimTimeout} />
            <Weather />
            <Time dim={dim} />
        </div>
    );
}
