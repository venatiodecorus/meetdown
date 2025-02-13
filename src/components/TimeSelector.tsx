import { useState } from "react";
import { Temporal } from "temporal-polyfill";

interface TimeSelectorProps {
  onTimeRangeChange: (range: [Temporal.PlainTime, Temporal.PlainTime]) => void;
}

export default function TimeSelector({ onTimeRangeChange }: TimeSelectorProps) {
  // TODO Use Temporal.Duration?
  const [startTime, setStartTime] = useState<Temporal.PlainTime | null>(null);
  const [endTime, setEndTime] = useState<Temporal.PlainTime | null>(null);

  const handleTimeChange = (time: string, isStart: boolean) => {
    const [hours, minutes] = time.split(":").map(Number);

    if (isStart) {
      const newStartTime = startTime
        ? startTime.with({ hour: hours, minute: minutes })
        : Temporal.PlainTime.from({ hour: hours, minute: minutes });
      setStartTime(newStartTime);
      if (newStartTime && endTime) {
        onTimeRangeChange([newStartTime, endTime]);
      }
    } else {
      const newEndTime = endTime
        ? endTime.with({ hour: hours, minute: minutes })
        : Temporal.PlainTime.from({ hour: hours, minute: minutes });
      setEndTime(newEndTime);
      if (startTime && newEndTime) {
        onTimeRangeChange([startTime, newEndTime]);
      }
    }
  };

  return (
    <div className="flex justify-center space-x-4">
      <input
        type="time"
        value={
          startTime
            ? `${String(startTime.hour).padStart(2, "0")}:${String(
                startTime.minute
              ).padStart(2, "0")}`
            : ""
        }
        onChange={(e) => handleTimeChange(e.target.value, true)}
        className="dark:bg-gray-800"
      />
      <input
        type="time"
        value={
          endTime
            ? `${String(endTime.hour).padStart(2, "0")}:${String(
                endTime.minute
              ).padStart(2, "0")}`
            : ""
        }
        onChange={(e) => handleTimeChange(e.target.value, false)}
        className="dark:bg-gray-800"
      />
    </div>
  );
}
