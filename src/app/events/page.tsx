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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 transition-colors">
          Create a new event
        </h1>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label 
              htmlFor="eventName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              Event Name
            </label>
            <input
              id="eventName"
              name="eventName"
              type="text"
              placeholder="Party!"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out
              dark:bg-gray-700 dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder-gray-400 dark:text-gray-100"
            />
          </div>

          <div className="space-y-4">
            <p>Click on a day to select that day. Click and drag to select a range of days.</p>
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors">
              <DateSelector onDateRangeChange={handleDateRangeChange} />
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors">
              <TimeSelector onTimeRangeChange={handleTimeRangeChange} />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
            transform transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-gray-100"
          >
            Create Event
          </button>
        </form>

        {hash && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 transition-all duration-300">
            <p className="text-green-800 dark:text-green-200 mb-2 font-medium">Event created successfully!</p>
            <a 
              href={hash}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline transition-colors"
            >
              {hash}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
