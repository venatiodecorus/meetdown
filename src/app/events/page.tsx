"use client";

import { useState, useCallback } from "react";
import DateSelector from "@/components/DateSelector";
import { EventRequest, createEvent } from "../../lib/events";
import TimeSelector from "@/components/TimeSelector";
import { Temporal } from "temporal-polyfill";

export default function Page() {
  const now = Temporal.Now.plainDateISO();
  const [selectedDates, setSelectedDates] = useState<Temporal.PlainDate[]>([now]);
  const [startTime, setStartTime] = useState<Temporal.PlainTime | null>(null);
  const [endTime, setEndTime] = useState<Temporal.PlainTime | null>(null);
  const [hash, setHash] = useState<string>("");

  const handleDateRangeChange = useCallback(
    (dates: Temporal.PlainDate[]) => {
      setSelectedDates(dates);
    },
    []
  );

  const handleTimeRangeChange = (
    newRange: [Temporal.PlainTime, Temporal.PlainTime]
  ) => {
    setStartTime(newRange[0]);
    setEndTime(newRange[1]);
    // Keep the existing date and only update the time
    // setRange([
    //   Temporal.PlainDateTime.from({
    //     ...dateRange[0],
    //     hour: newRange[0].hour,
    //     minute: newRange[0].minute,
    //   }),
    //   Temporal.PlainDateTime.from({
    //     ...dateRange[1],
    //     hour: newRange[1].hour,
    //     minute: newRange[1].minute,
    //   }),
    // ]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const eventName = formData.get("eventName") as string;

    if (!eventName || selectedDates.length === 0) {
      return false;
    }

    // Sort dates to get the earliest and latest
    const sortedDates = [...selectedDates].sort(Temporal.PlainDate.compare);
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    const newEvent: EventRequest = {
      name: eventName,
      dates: {
        start: startDate.toString(),
        end: endDate.toString(),
      },
      startTime: (startTime ?? Temporal.PlainTime.from("00:00")).toString(),
      endTime: (endTime ?? Temporal.PlainTime.from("23:59")).toString(),
      dateRanges: selectedDates.map(date => date.toString()),
    };

    const hash = await createEvent(newEvent);
    if (hash) {
      setURL(hash);
    }
  };

  const setURL = (hash: string) => {
    const url = `${window.location.origin}/events/${hash}`;
    setHash(url);
  };

  return (
    <>
      <p className="text-2xl">Create a new event</p>
      <form className="flex max-w-5xl flex-col gap-4" onSubmit={handleSubmit}>
        <label htmlFor="eventName">Event Name</label>
        <input
          id="eventName"
          name="eventName"
          type="text"
          placeholder="Party!"
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder-gray-400 dark:text-gray-400"
        />

        <DateSelector onDateRangeChange={handleDateRangeChange} />
        <TimeSelector onTimeRangeChange={handleTimeRangeChange} />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg dark:bg-blue-700 dark:text-gray-200"
        >
          Submit
        </button>
      </form>

      <div className="grid w-full max-w-80">
        <div className="relative">
          <label htmlFor="npm-install" className="sr-only">
            Label
          </label>
          <input
            id="npm-install"
            type="text"
            className="col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-4 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            value={hash}
            disabled
            readOnly
          />
          {/* <Clipboard.WithIconText valueToCopy={hash ?? ""} /> */}
        </div>
      </div>
    </>
  );
}
