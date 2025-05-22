import { useState, useCallback, useEffect } from "react";
import { Temporal } from "temporal-polyfill";

interface TimeSlot {
  startTime: Temporal.PlainTime;
  endTime: Temporal.PlainTime;
}

interface TimeSelectorProps {
  // onTimeRangeChange: (range: [Temporal.PlainTime, Temporal.PlainTime]) => void;
  onTimeSelectionChange: (selectedTimes: TimeSlot[]) => void; // Updated prop
}

export default function TimeSelector({ onTimeSelectionChange }: TimeSelectorProps) {
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([]);
  const [isRangeSelecting, setIsRangeSelecting] = useState(false);
  const [rangeStart, setRangeStart] = useState<Temporal.PlainTime | null>(null);
  const [hoverTime, setHoverTime] = useState<Temporal.PlainTime | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Define the time slot interval (e.g., 30 minutes)
  const SLOT_DURATION_MINUTES = 30;

  // Generate time slots for a 24-hour period
  const generateTimeSlots = useCallback((): Temporal.PlainTime[] => {
    const slots: Temporal.PlainTime[] = [];
    let currentTime = Temporal.PlainTime.from({ hour: 0, minute: 0 });
    // Calculate the total number of slots in a 24-hour period
    const numberOfSlots = (24 * 60) / SLOT_DURATION_MINUTES;

    for (let i = 0; i < numberOfSlots; i++) {
      slots.push(currentTime);
      // Prepare the next slot time. PlainTime.add() handles balancing across midnight.
      currentTime = currentTime.add({ minutes: SLOT_DURATION_MINUTES });
    }
    return slots;
  }, [SLOT_DURATION_MINUTES]);

  const timeSlots = generateTimeSlots();

  const toggleTimeSlot = useCallback((time: Temporal.PlainTime) => {
    setSelectedTimes(prev => {
      const slotEndTime = time.add({ minutes: SLOT_DURATION_MINUTES });
      const newSlot = { startTime: time, endTime: slotEndTime };
      const isSelected = prev.some(
        s => Temporal.PlainTime.compare(s.startTime, newSlot.startTime) === 0
      );
      if (isSelected) {
        return prev.filter(
          s => Temporal.PlainTime.compare(s.startTime, newSlot.startTime) !== 0
        );
      } else {
        return [...prev, newSlot].sort((a, b) => Temporal.PlainTime.compare(a.startTime, b.startTime));
      }
    });
  }, [SLOT_DURATION_MINUTES]);

  const handleMouseDown = useCallback((time: Temporal.PlainTime) => {
    setIsRangeSelecting(true);
    setRangeStart(time);
    setHoverTime(time);
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((time: Temporal.PlainTime) => {
    if (isRangeSelecting) {
      setIsDragging(true);
      setHoverTime(time);
    }
  }, [isRangeSelecting]);

  const handleMouseUp = useCallback((time: Temporal.PlainTime) => {
    if (isRangeSelecting) {
      const currentRangeStart = rangeStart; // Capture value for closure
      const currentHoverTime = hoverTime; // Capture value for closure

      if (isDragging && currentRangeStart && currentHoverTime) {
        const start = Temporal.PlainTime.compare(currentRangeStart, currentHoverTime) <= 0
          ? currentRangeStart
          : currentHoverTime;
        const end = Temporal.PlainTime.compare(currentRangeStart, currentHoverTime) <= 0
          ? currentHoverTime
          : currentRangeStart;

        const slotsInRange: TimeSlot[] = [];
        let current = start;
        // Iterate up to and including the 'end' time slot.
        // The loop should continue as long as 'current' is less than or equal to 'end'.
        while (Temporal.PlainTime.compare(current, end) <= 0) {
          slotsInRange.push({
            startTime: current,
            endTime: current.add({ minutes: SLOT_DURATION_MINUTES }),
          });
          current = current.add({ minutes: SLOT_DURATION_MINUTES });
        }
        

        setSelectedTimes(prev => {
          const newSlotsMap = new Map<string, TimeSlot>();
          prev.forEach(slot => newSlotsMap.set(slot.startTime.toString(), slot));
          slotsInRange.forEach(slot => newSlotsMap.set(slot.startTime.toString(), slot));
          return Array.from(newSlotsMap.values()).sort((a,b) => Temporal.PlainTime.compare(a.startTime, b.startTime));
        });

      } else {
        // Handle single click
        toggleTimeSlot(time);
      }
    }
    setIsRangeSelecting(false);
    setRangeStart(null);
    setHoverTime(null);
    setIsDragging(false);
  }, [isRangeSelecting, isDragging, rangeStart, hoverTime, toggleTimeSlot, SLOT_DURATION_MINUTES]);


  useEffect(() => {
    onTimeSelectionChange(selectedTimes);
  }, [selectedTimes, onTimeSelectionChange]);


  return (
    <div className="p-4 max-w-md mx-auto" onMouseLeave={() => {
      if (isRangeSelecting) {
        const lastValidTime = hoverTime ?? rangeStart;
        if (lastValidTime) {
          // handleMouseUp is responsible for all state cleanup
          handleMouseUp(lastValidTime);
        } else {
          // Fallback: If isRangeSelecting is true but no valid time to pass to handleMouseUp,
          // (e.g. mousedown happened, then immediately mouseleave before any mousemove over a slot)
          // reset the dragging states directly.
          setIsRangeSelecting(false);
          setRangeStart(null);
          setHoverTime(null);
          setIsDragging(false);
        }
      }
    }}>
      <div className="text-center font-semibold mb-4">Select Time Slots</div>
      <div className="flex space-x-4 justify-center"> {/* Main container for two columns */}
        {/* Morning Column */}
        <div className="flex-1">
          <div className="text-center text-sm font-medium mb-2">Morning</div>
          <div className="grid grid-cols-1 gap-1">
            {timeSlots
              .filter(slot => slot.hour < 12)
              .map((slot) => {
                const displayTime = slot.toLocaleString("default", {
                  hour: "numeric",
                  minute: "2-digit",
                });
                const isSelected = selectedTimes.some(
                  (selectedSlot) =>
                    Temporal.PlainTime.compare(selectedSlot.startTime, slot) === 0
                );
                const isInTempRange = isRangeSelecting && rangeStart && hoverTime && (
                  (Temporal.PlainTime.compare(slot, rangeStart) >= 0 && Temporal.PlainTime.compare(slot, hoverTime) <= 0) ||
                  (Temporal.PlainTime.compare(slot, rangeStart) <= 0 && Temporal.PlainTime.compare(slot, hoverTime) >= 0)
                );
                return (
                  <div
                    key={`${slot.toString()}-morning`}
                    className={`p-2 border rounded cursor-pointer text-center select-none text-xs
                      ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}
                      ${isInTempRange ? "bg-blue-200 dark:bg-blue-200" : ""} {/* Ensure light and dark mode use bg-blue-200 for temp range */}
                      hover:bg-gray-200 dark:hover:bg-gray-700`}
                    onMouseDown={() => handleMouseDown(slot)}
                    onMouseMove={() => handleMouseMove(slot)}
                    onMouseUp={() => handleMouseUp(slot)}
                  >
                    {displayTime}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Afternoon/Evening Column */}
        <div className="flex-1">
          <div className="text-center text-sm font-medium mb-2">Afternoon/Evening</div>
          <div className="grid grid-cols-1 gap-1">
            {timeSlots
              .filter(slot => slot.hour >= 12)
              .map((slot) => {
                const displayTime = slot.toLocaleString("default", {
                  hour: "numeric",
                  minute: "2-digit",
                });
                const isSelected = selectedTimes.some(
                  (selectedSlot) =>
                    Temporal.PlainTime.compare(selectedSlot.startTime, slot) === 0
                );
                const isInTempRange = isRangeSelecting && rangeStart && hoverTime && (
                  (Temporal.PlainTime.compare(slot, rangeStart) >= 0 && Temporal.PlainTime.compare(slot, hoverTime) <= 0) ||
                  (Temporal.PlainTime.compare(slot, rangeStart) <= 0 && Temporal.PlainTime.compare(slot, hoverTime) >= 0)
                );
                return (
                  <div
                    key={`${slot.toString()}-afternoon`}
                    className={`p-2 border rounded cursor-pointer text-center select-none text-xs
                      ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}
                      ${isInTempRange ? "bg-blue-200 dark:bg-blue-200" : ""} {/* Ensure light and dark mode use bg-blue-200 for temp range */}
                      hover:bg-gray-200 dark:hover:bg-gray-700`}
                    onMouseDown={() => handleMouseDown(slot)}
                    onMouseMove={() => handleMouseMove(slot)}
                    onMouseUp={() => handleMouseUp(slot)}
                  >
                    {displayTime}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      {/* Placeholder for current selection display or debugging */}
      {/* <div className="mt-4 text-xs">
        Selected: {selectedTimes.map(s => `${s.startTime.toString()} - ${s.endTime.toString()}`).join(', ')}
        <br />
        Range Start: {rangeStart?.toString()}
        <br />
        Hover Time: {hoverTime?.toString()}
        <br />
        Is Dragging: {isDragging.toString()}
      </div> */}
    </div>
  );
}
