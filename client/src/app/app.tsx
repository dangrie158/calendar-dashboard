import React, { useCallback, useState, useEffect } from "react";
import "./app.css";

import Wallpaper from "./wallpaper.tsx";
import Calendar from "./calendar.tsx";
import Weather from "./weather.tsx";
import Time from "./time.tsx";
import { fetcher } from "../backend.tsx";
import useSWR from "swr";
import { BrightnessResponse } from "../../../server/brightness.ts";

const DIM_TIMEOUT = 1000 * 60 * 5;

export default function App() {
    const [dim, setDim] = useState(false);
    const [dimTimeout, setDimTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
    const { data: brightnessConfig } = useSWR<BrightnessResponse>("brightness", fetcher, {
        refreshInterval: 1000 * 60,
        keepPreviousData: true,
    });
    const resetDimTimeout = useCallback(() => {
        if (dimTimeout !== undefined) {
            clearTimeout(dimTimeout);
        }

        setDim(false);

        setDimTimeout(
            setTimeout(() => {
                const hour = new Date().getHours();
                if (hour >= (brightnessConfig?.dimbefore ?? 4) && hour < (brightnessConfig?.dimafter ?? 20)) {
                    resetDimTimeout();
                    return;
                }

                setDim(true);
            }, DIM_TIMEOUT)
        );
    }, [dimTimeout]);

    useEffect(() => {
        fetcher("brightness", { method: "PUT", body: JSON.stringify({ dim: dim }) });
    }, [dim]);

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
