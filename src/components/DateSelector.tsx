import { useState, useMemo, useCallback, useEffect } from "react";
import { Temporal } from "temporal-polyfill";

interface DateSelectorProps {
  onDateRangeChange: (dates: Temporal.PlainDate[]) => void;
}

/**
 * Renders UI and allows for selection of a date range.
 * @param onDateRangeChange Callback function to handle date range changes.
 * @returns
 */
export default function DateSelector({ onDateRangeChange }: DateSelectorProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = Temporal.Now.plainDateISO();
    return Temporal.PlainDate.from({
      year: today.year,
      month: today.month,
      day: 1
    });
  });
  
  const [selectedDates, setSelectedDates] = useState<Temporal.PlainDate[]>([]);
  const [isRangeSelecting, setIsRangeSelecting] = useState(false);
  const [rangeStart, setRangeStart] = useState<Temporal.PlainDate | null>(null);
  const [hoverDate, setHoverDate] = useState<Temporal.PlainDate | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const { firstDayOfMonth, daysInMonth } = useMemo(() => {
    const firstDay = currentDate.dayOfWeek % 7;
    const days = currentDate.daysInMonth;
    return { firstDayOfMonth: firstDay, daysInMonth: days };
  }, [currentDate]);

  const toggleDate = useCallback((date: Temporal.PlainDate) => {
    setSelectedDates(prev => {
      const isSelected = prev.some(d => 
        Temporal.PlainDate.compare(d, date) === 0
      );
      
      if (isSelected) {
        return prev.filter(d => 
          Temporal.PlainDate.compare(d, date) !== 0
        );
      } else {
        return [...prev, date];
      }
    });
  }, []);

  const onMouseDown = useCallback((date: Temporal.PlainDate) => {
    setIsRangeSelecting(true);
    setRangeStart(date);
    setHoverDate(date);
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback((date: Temporal.PlainDate) => {
    if (isRangeSelecting) {
      setIsDragging(true);
      setHoverDate(date);
    }
  }, [isRangeSelecting]);

  const onMouseUp = useCallback((date: Temporal.PlainDate) => {
    if (isRangeSelecting) {
      if (isDragging) {
        // Handle range selection
        const start = Temporal.PlainDate.compare(rangeStart!, hoverDate!) <= 0 
          ? rangeStart! 
          : hoverDate!;
        const end = Temporal.PlainDate.compare(rangeStart!, hoverDate!) <= 0 
          ? hoverDate! 
          : rangeStart!;

        const datesInRange: Temporal.PlainDate[] = [];
        let current = start;
        while (Temporal.PlainDate.compare(current, end) <= 0) {
          datesInRange.push(current);
          current = current.add({ days: 1 });
        }

        setSelectedDates(prev => {
          const newDates = new Set([...prev.map(d => d.toString()), ...datesInRange.map(d => d.toString())]);
          return Array.from(newDates).map(d => Temporal.PlainDate.from(d));
        });
      } else {
        // Handle single click
        toggleDate(date);
      }
    }
    
    setIsRangeSelecting(false);
    setRangeStart(null);
    setHoverDate(null);
    setIsDragging(false);
  }, [isRangeSelecting, isDragging, rangeStart, hoverDate, toggleDate]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(date => date.subtract({ months: 1 }));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(date => date.add({ months: 1 }));
  }, []);

  useEffect(() => {
    onDateRangeChange(selectedDates);
  }, [selectedDates, onDateRangeChange]);

  const days = useMemo(() => {
    const dayElements = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayElements.push(
        <div key={`empty-${i}`} className="border border-gray-200 h-12"></div>
      );
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDateInMonth = Temporal.PlainDate.from({ 
        year: currentDate.year, 
        month: currentDate.month, 
        day: i 
      });
      
      const isSelected = selectedDates.some(d => 
        Temporal.PlainDate.compare(d, currentDateInMonth) === 0
      );

      const isInTempRange = isRangeSelecting && rangeStart && hoverDate && (
        Temporal.PlainDate.compare(currentDateInMonth, rangeStart) >= 0 &&
        Temporal.PlainDate.compare(currentDateInMonth, hoverDate) <= 0 ||
        Temporal.PlainDate.compare(currentDateInMonth, rangeStart) <= 0 &&
        Temporal.PlainDate.compare(currentDateInMonth, hoverDate) >= 0
      );

      dayElements.push(
        <div
          key={i}
          className={`border border-gray-200 h-12 flex items-center justify-center cursor-pointer select-none
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${isInTempRange ? 'bg-blue-200' : ''}
            hover:bg-gray-100`}
          onMouseDown={() => onMouseDown(currentDateInMonth)}
          onMouseMove={() => onMouseMove(currentDateInMonth)}
          onMouseUp={() => onMouseUp(currentDateInMonth)}
        >
          {i}
        </div>
      );
    }
    return dayElements;
  }, [
    firstDayOfMonth,
    daysInMonth,
    currentDate,
    selectedDates,
    isRangeSelecting,
    rangeStart,
    hoverDate,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  ]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div
          onClick={handlePreviousMonth}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <svg 
            className="h-4 w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </div>
        <div className="text-center font-bold text-lg">
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.year}
        </div>
        <div
          onClick={handleNextMonth}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <svg 
            className="h-4 w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
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
