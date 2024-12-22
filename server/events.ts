import { Context } from "@oak/oak/context";
import ical from "ical";
import { RRule } from "rrule";

import { calendars } from "../config.ts";
import cachedFetch from "./util/cachedFetch.ts";

export async function get(context: Context) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const relevant_event_promises = calendars.flatMap(async (calendar: Calendar) => {
        const response = await cachedFetch(calendar.url, { cacheLifetime: 1000 * 60 * 15 });
        const calendarData = await response.text();
        const allEvents = ical.parseICS(calendarData) as ICalEvent[];

        return Object.values(allEvents).map((event) => {
            let startDate = event.rrule === undefined ? event.start : event.rrule.after(today);

            if (!startDate) {
                return null;
            }

            const duration = event.end.getTime() - event.start.getTime();
            const eventDate = startDate.toISOString().split("T")[0];

            // check if the event is excluded on this date
            if (event.exdate?.[eventDate] !== undefined) {
                return null;
            }

            // check if the event has a recurrence change on this date
            const recurrence_change = event.recurrences?.[eventDate];
            if (recurrence_change !== undefined) {
                startDate = recurrence_change.start_date;
            }

            return {
                uuid: event.uid,
                start: startDate.toLocaleString(),
                end: new Date(startDate.getTime() + duration).toLocaleString(),
                summary: typeof event.summary === "string" ? event.summary : event.summary?.val ?? "",
                calendar: calendar.name,
                color: calendar.color,
            };
        });
    });

    const relevant_events = (await Promise.all(relevant_event_promises))
        .flat()
        .filter((event) => event !== null)
        .filter((event) => new Date(event?.end) > today)
        .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 20);
    context.response.body = (await Promise.all(relevant_events)).flat();
}

type Calendar = {
    name: string;
    url: string;
    color: string;
};

type ICalEvent = {
    uid: string;
    start: Date;
    end: Date;
    summary: { val: string } | string;
    rrule: RRule;
    recurrences: { [date: string]: { start_date: Date } };
    exdate: { [date: string]: string };
};

type Event = {
    uuid: string;
    start: string;
    end: string;
    summary: string;
    calendar: string;
    color: string;
};

export type EventResponse = Event[];
