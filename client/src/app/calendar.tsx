import React, { useEffect } from "react";

import "./calendar.css";
import { fetcher } from "../backend.tsx";
import useSWR from "swr";
import { EventResponse } from "../../../server/events.ts";

export default function Calendar({ resetDimTimeout }: { resetDimTimeout: () => void }) {
    const { data } = useSWR<EventResponse>(`events`, fetcher, {
        refreshInterval: 1000 * 60 * 5,
        keepPreviousData: true,
    });

    useEffect(() => {
        if (data?.some((event) => new Date(event.start) > new Date())) {
            // If there is an event in the future, reset the dim timeout
            resetDimTimeout();
        }
    }, [data]);

    const dateToLocale = (date: Date) => {
        const weekDay = date.toLocaleString(undefined, { weekday: "long" });
        const day = date.toLocaleString(undefined, { day: "2-digit" });
        const month = date.toLocaleString(undefined, { month: "long" });

        const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

        const hash = `${weekDay}${day}${month}${date.getFullYear()}`;

        return {
            hash,
            node: () => (
                <div className="event-title-date">
                    <span>{day}</span> {isToday ? "Heute" : `${month}, ${weekDay}`}
                </div>
            ),
        };
    };

    let currentTitleHash = "";
    return (
        <div className="calendar">
            {data?.map((event) => {
                const eventStart = new Date(event.start);
                const { hash, node: TitleNode } = dateToLocale(eventStart);

                const addTitle = currentTitleHash !== hash;
                currentTitleHash = hash;
                return (
                    <React.Fragment key={event.uuid}>
                        {addTitle ? <TitleNode /> : <></>}
                        <div className="event">
                            <span style={{ background: event.color }} />
                            <span>
                                {eventStart.getHours().toString().padStart(2, "0")}:
                                {eventStart.getMinutes().toString().padStart(2, "0")}
                            </span>
                            <span>{event.summary}</span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
