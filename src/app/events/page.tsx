"use client";

import { useState } from "react";
import DateSelector from "@/components/DateSelector";
import { Event, createEvent } from "../../lib/events";
import TimeSelector from "@/components/TimeSelector";

export default function Page() {
  type ValuePiece = Date;
  type Value = [ValuePiece, ValuePiece];

  const [value, onChange] = useState<Value>([new Date(), new Date()]);
  const [hash, setHash] = useState<string>();

  const handleDateRangeChange = (range: [Date, Date]) => {
    onChange(range);
  };

  const handleTimeRangeChange = (range: [Date, Date]) => {
    // Keep the existing date and only update the time
    const newRange: Value = [new Date(value[0]), new Date(value[1])];
    newRange[0].setHours(range[0].getHours());
    newRange[0].setMinutes(range[0].getMinutes());
    newRange[1].setHours(range[1].getHours());
    newRange[1].setMinutes(range[1].getMinutes());
    onChange(newRange);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const eventName = formData.get("eventName") as string;

    if (!eventName) {
      return false;
    }

    if (!Array.isArray(value)) {
      return false;
    }

    if (value[0] == null || value[1] == null) {
      return false;
    }

    const newEvent: Event = {
      name: eventName,
      dates: {
        start: value[0],
        end: value[1],
      },
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
      <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
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
