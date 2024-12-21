import { Context } from "@oak/oak/context";
import { weather as weatherConfig } from "../config.ts";
import cachedFetch from "./util/cachedFetch.ts";

export async function get(context: Context) {
    const { latitude, longitude } = weatherConfig;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,weathercode&hourly=temperature_2m,relativehumidity_2m,weathercode&timeformat=unixtime&timezone=GMT&forecast_days=3`;
    const response = await cachedFetch(url, { cacheLifetime: 1000 * 60 * 15 });
    const weatherData: MeteoResponse = await response.json();

    const dailyData = aggregateDaily(weatherData.hourly);

    context.response.body = {
        current: formatWeatherInfo(weatherData.current, weatherData.current_units),
        daily: Object.values(dailyData).map((day) => {
            return {
                date: day.date,
                max: formatWeatherInfo(day.max, weatherData.hourly_units),
                min: formatWeatherInfo(day.min, weatherData.hourly_units),
            };
        }),
    };
}

function formatWeatherInfo(info: WeatherInfo, units: MeteoUnitResponse) {
    return {
        temperature: `${Math.round(info.temperature_2m)} ${units.temperature_2m}`,
        humidity: `${Math.round(info.relativehumidity_2m)} ${units.relativehumidity_2m}`,
        weathercode: info.weathercode,
    };
}

function aggregateDaily(data: MeteoResponse["hourly"]) {
    return data.time.reduce((acc: Record<string, Daily>, timeStamp: number, index: number) => {
        const time = new Date(timeStamp * 1000).toLocaleString(undefined, {
            month: "long",
            day: "2-digit",
            year: "numeric",
        });

        if (acc[time] === undefined) {
            acc[time] = {
                date: new Date(timeStamp * 1000),
                max: {
                    temperature_2m: Number.MIN_VALUE,
                    relativehumidity_2m: Number.MIN_VALUE,
                    weathercode: Number.MIN_VALUE,
                },
                min: {
                    temperature_2m: Number.MAX_VALUE,
                    relativehumidity_2m: Number.MAX_VALUE,
                    weathercode: Number.MAX_VALUE,
                },
            };
        }

        acc[time].min.temperature_2m = Math.min(acc[time].min.temperature_2m, data.temperature_2m[index]);
        acc[time].max.temperature_2m = Math.max(acc[time].max.temperature_2m, data.temperature_2m[index]);
        acc[time].min.relativehumidity_2m = Math.min(
            acc[time].min.relativehumidity_2m,
            data.relativehumidity_2m[index]
        );
        acc[time].max.relativehumidity_2m = Math.max(
            acc[time].max.relativehumidity_2m,
            data.relativehumidity_2m[index]
        );
        acc[time].min.weathercode = Math.min(acc[time].min.weathercode, data.weathercode[index]);
        acc[time].max.weathercode = Math.max(acc[time].max.weathercode, data.weathercode[index]);
        return acc;
    }, {}) as Record<string, Daily>;
}

type FormattedWeatherData = {
    temperature: string;
    humidity: string;
    weathercode: number;
};
export type WeatherResponse = {
    current: FormattedWeatherData;
    daily: { date: string; max: FormattedWeatherData; min: FormattedWeatherData }[];
};
type WeatherInfo = {
    temperature_2m: number;
    relativehumidity_2m: number;
    weathercode: number;
};

type Daily = {
    max: WeatherInfo;
    min: WeatherInfo;
    date: Date;
};

type MeteoUnitResponse = {
    time: string;
    interval: string;
    temperature_2m: string;
    relativehumidity_2m: string;
    weathercode: string;
};

type MeteoResponse = {
    latitude: number;
    longitude: number;
    current_units: MeteoUnitResponse;
    current: {
        time: number;
        interval: number;
        temperature_2m: number;
        relativehumidity_2m: number;
        weathercode: number;
    };
    hourly_units: MeteoUnitResponse;
    hourly: {
        time: number[];
        temperature_2m: number[];
        relativehumidity_2m: number[];
        weathercode: number[];
    };
};
