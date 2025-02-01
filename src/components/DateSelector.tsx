import { useState } from "react";

interface DateSelectorProps {
  onDateRangeChange: (range: [Date, Date]) => void;
}

export default function DateSelector({ onDateRangeChange }: DateSelectorProps) {
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(month, year);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(
      <div key={`empty-${i}`} className="border border-gray-200 h-12"></div>
    );
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(year, month, i);
    const isHighlighted =
      (startDate &&
        endDate &&
        currentDate >= startDate &&
        currentDate <= endDate) ||
      (startDate &&
        !endDate &&
        hoverDate &&
        currentDate >= startDate &&
        currentDate <= hoverDate);
    days.push(
      <div
        key={i}
        className={`border border-gray-200 h-12 flex items-center justify-center ${
          isHighlighted ? "bg-gray-600" : ""
        }`}
        onClick={() => onClick(i)}
        onMouseOver={() => onHover(currentDate)}
      >
        {i}
      </div>
    );
  }

  const onClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    console.log(
      `Start Date: ${startDate}\nEnd Date: ${endDate}\nHover Date: ${hoverDate}`
    );
    if (!startDate) {
      setStartDate(selectedDate);
    } else if (!endDate) {
      setEndDate(selectedDate);
      onDateRangeChange([startDate, selectedDate]);
    } else {
      setStartDate(selectedDate);
      setEndDate(null);
      setHoverDate(null);
    }
  };

  const onHover = (date: Date) => {
    if (startDate && !endDate) {
      setHoverDate(date);
      console.log(date);
    }
  };

  return (
    <div className="p-4">
      <div className="text-center font-bold text-lg mb-4">
        {new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
        {year}
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">{days}</div>
    </div>
  );
}
