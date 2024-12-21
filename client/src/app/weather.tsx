import React from "react";

import * as Icons from "./weather-icons.tsx";
import "./weather.css";
import useSWR from "swr";
import { fetcher } from "../backend.tsx";
import { WeatherResponse } from "../../../server/weather.ts";

export default function Weather() {
    const { data } = useSWR<WeatherResponse>("weather", fetcher, {
        refreshInterval: 1000 * 60 * 15,
        keepPreviousData: true,
    });

    if (data === undefined) {
        return <div className="weather">Loading...</div>;
    }

    const CurrentIcon = getIconForWeatherCode(data.current.weathercode);
    return (
        <div className="weather">
            <div className="c-weather">
                <span>{data.current.temperature}</span>
                <CurrentIcon color="#fff" size={60} />
            </div>
            <div className="del-weather" />
            <div className="d-weather">
                {data.daily.map((daily) => {
                    const DailyIcon = getIconForWeatherCode(daily.max.weathercode);
                    const weekDay = new Date(daily.date).toLocaleDateString(undefined, {
                        weekday: "short",
                    });
                    const isToday =
                        weekDay ===
                        new Date().toLocaleDateString(undefined, {
                            weekday: "short",
                        });

                    return (
                        <div key={daily.date}>
                            <span>{isToday ? "Today" : weekDay}</span>
                            <DailyIcon color="#fff" size={40} />
                            <span>
                                {daily.max.temperature} {daily.min.temperature}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function getIconForWeatherCode(code: number) {
    if (code >= 20 && code <= 29) {
        return Icons.Showers;
    }

    if (code >= 36 && code <= 39) {
        return Icons.NightSleet;
    }

    if ((code >= 40 && code <= 49) || (code >= 4 && code <= 19)) {
        return Icons.Fog;
    }

    if (code >= 50 && code <= 59) {
        return Icons.Raindrops;
    }

    if ((code >= 70 && code <= 75) || (code >= 77 && code <= 79)) {
        return Icons.SnowflakeCold;
    }

    if (code === 76) {
        return Icons.Dust;
    }

    if ((code >= 60 && code <= 67) || (code >= 80 && code <= 83) || code === 91 || code === 92) {
        return Icons.Rain;
    }

    if (code === 84 || code === 68 || code === 69) {
        return Icons.RainMix;
    }

    if (code >= 85 && code <= 90) {
        return Icons.SnowWind;
    }

    if (code === 93 || code === 94 || code === 99 || code === 96) {
        return Icons.Hail;
    }

    if (code === 95) {
        return Icons.Thunderstorm;
    }

    if (code === 97) {
        return Icons.NightSnowThunderstorm;
    }

    if (code === 98 || (code >= 30 && code <= 35)) {
        return Icons.Sandstorm;
    }

    return Icons.DaySunny;
}
