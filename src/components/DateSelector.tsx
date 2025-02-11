import { useState, useMemo, useCallback } from "react";

interface DateSelectorProps {
  onDateRangeChange: (range: [Date, Date]) => void;
}

/**
 * Renders UI and allows for selection of a date range.
 * @param onDateRangeChange Callback function to handle date range changes.
 * @returns
 */
export default function DateSelector({ onDateRangeChange }: DateSelectorProps) {
  const [month] = useState<number>(new Date().getMonth());
  const [year] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // const getDaysInMonth = (month: number, year: number) => {
  //   return new Date(year, month + 1, 0).getDate();
  // };

  // const firstDayOfMonth = new Date(year, month, 1).getDay();
  // const daysInMonth = getDaysInMonth(month, year);
  const { firstDayOfMonth, daysInMonth } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDayOfMonth: firstDay, daysInMonth: days };
  }, [year, month]);

  // const onClick = useCallback(
  //   (day: number) => {
  //     const selectedDate = new Date(year, month, day);
  //     console.log(
  //       `Start Date: ${startDate}\nEnd Date: ${endDate}\nHover Date: ${hoverDate}`
  //     );
  //     if (!startDate) {
  //       setStartDate(selectedDate);
  //     } else if (!endDate) {
  //       setEndDate(selectedDate);
  //       onDateRangeChange([startDate, selectedDate]);
  //     } else {
  //       setStartDate(selectedDate);
  //       setEndDate(null);
  //       setHoverDate(null);
  //     }
  //   },
  //   [year, month, startDate, endDate, hoverDate, onDateRangeChange]
  // );
  const onClick = useCallback(
    (day: number) => {
      const selectedDate = new Date(year, month, day);
      setStartDate((prevStart) => {
        if (!prevStart) {
          return selectedDate;
        }
        setEndDate((prevEnd) => {
          // If end date is not set, call onDateRangeChange
          if (!prevEnd) {
            onDateRangeChange([prevStart, selectedDate]);
            return selectedDate;
          }
          // If both set, restart by replacing start
          setHoverDate(null);
          return null;
        });
        return selectedDate;
      });
    },
    [year, month, onDateRangeChange]
  );

  const onHover = useCallback(
    (date: Date) => {
      if (startDate && !endDate) {
        setHoverDate(date);
        console.log(date);
      }
    },
    [startDate, endDate]
  );

  const days = useMemo(() => {
    const dayElements = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayElements.push(
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
      dayElements.push(
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
    return dayElements;
    // include dependencies so it's re-computed when they change
  }, [
    firstDayOfMonth,
    daysInMonth,
    month,
    year,
    startDate,
    endDate,
    hoverDate,
    onClick,
    onHover,
  ]);

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
