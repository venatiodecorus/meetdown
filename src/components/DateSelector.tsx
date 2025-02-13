import { useState, useMemo, useCallback, useEffect } from "react";
import { Temporal } from "temporal-polyfill";

interface DateSelectorProps {
  onDateRangeChange: (range: [Temporal.PlainDate, Temporal.PlainDate]) => void;
}

/**
 * Renders UI and allows for selection of a date range.
 * @param onDateRangeChange Callback function to handle date range changes.
 * @returns
 */
export default function DateSelector({ onDateRangeChange }: DateSelectorProps) {
  const [month] = useState<number>(Temporal.Now.plainDateISO().month);
  const [year] = useState<number>(Temporal.Now.plainDateISO().year);
  const [startDate, setStartDate] = useState<Temporal.PlainDate | null>(null);
  const [endDate, setEndDate] = useState<Temporal.PlainDate | null>(null);
  const [hoverDate, setHoverDate] = useState<Temporal.PlainDate | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // const getDaysInMonth = (month: number, year: number) => {
  //   return new Date(year, month + 1, 0).getDate();
  // };

  // const firstDayOfMonth = new Date(year, month, 1).getDay();
  // const daysInMonth = getDaysInMonth(month, year);
  const { firstDayOfMonth, daysInMonth } = useMemo(() => {
    const firstDay =
      Temporal.PlainDate.from({ year, month: month, day: 1 }).dayOfWeek % 7;
    const days = Temporal.PlainDate.from({
      year,
      month: month,
      day: 1,
    }).daysInMonth;
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
      const selectedDate = Temporal.PlainDate.from({ year, month, day });
      if (!startDate || (startDate && endDate)) {
        // No start date or full range already selected, start new range.
        setStartDate(selectedDate);
        setEndDate(null);
        setHoverDate(null);
      } else if (!endDate) {
        // Range in progress, so set the end date.
        setEndDate(selectedDate);
      }
    },
    [startDate, endDate, year, month]
  );

  const onHover = useCallback(
    (date: Temporal.PlainDate) => {
      if (startDate && !endDate) {
        setHoverDate(date);
      }
    },
    [startDate, endDate]
  );

  // Trigger parent's onDateRangeChange after both startDate and endDate are set.
  useEffect(() => {
    if (startDate && endDate) {
      onDateRangeChange([startDate, endDate]);
    }
  }, [startDate, endDate, onDateRangeChange]);

  const days = useMemo(() => {
    const dayElements = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayElements.push(
        <div key={`empty-${i}`} className="border border-gray-200 h-12"></div>
      );
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = Temporal.PlainDate.from({ year, month, day: i });
      const isHighlighted =
        (startDate &&
          endDate &&
          Temporal.PlainDate.compare(currentDate, startDate) >= 0 &&
          Temporal.PlainDate.compare(currentDate, endDate) <= 0) ||
        (startDate &&
          !endDate &&
          hoverDate &&
          Temporal.PlainDate.compare(currentDate, startDate) >= 0 &&
          Temporal.PlainDate.compare(currentDate, hoverDate) <= 0);
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
