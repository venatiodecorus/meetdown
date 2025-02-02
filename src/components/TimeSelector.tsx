import { useState } from "react";

interface TimeSelectorProps {
  onTimeRangeChange: (range: [Date, Date]) => void;
}

export default function TimeSelector({ onTimeRangeChange }: TimeSelectorProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const handleTimeChange = (time: string, isStart: boolean) => {
    const [hours, minutes] = time.split(":").map(Number);

    if (isStart) {
      const newStartTime = startTime ? new Date(startTime) : new Date();
      newStartTime.setHours(hours, minutes);
      setStartTime(newStartTime);
      if (newStartTime && endTime) {
        onTimeRangeChange([newStartTime, endTime]);
      }
    } else {
      const newEndTime = endTime ? new Date(endTime) : new Date();
      newEndTime.setHours(hours, minutes);
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
            ? `${String(startTime.getHours()).padStart(2, "0")}:${String(
                startTime.getMinutes()
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
            ? `${String(endTime.getHours()).padStart(2, "0")}:${String(
                endTime.getMinutes()
              ).padStart(2, "0")}`
            : ""
        }
        onChange={(e) => handleTimeChange(e.target.value, false)}
        className="dark:bg-gray-800"
      />
    </div>
  );
}
