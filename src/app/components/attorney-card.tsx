import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
  duration: string;
}

interface AttorneyCardProps {
  initials: string;
  name: string;
  title: string;
  specialization: string;
  timeSlots: TimeSlot[];
  onSelectSlot: (attorney: string, slot: TimeSlot, dayOfWeek: number) => void;
  selectedSlotId?: string;
  weekRange: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

// Helper to extract day of week from time string (e.g., "Mon 9:00 AM" -> 0 for Monday)
function getDayOfWeek(timeString: string): number {
  const dayMap: { [key: string]: number } = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
  };
  const day = timeString.split(" ")[0];
  return dayMap[day] || 0;
}

export const AttorneyCard = ({
  initials,
  name,
  title,
  specialization,
  timeSlots,
  onSelectSlot,
  selectedSlotId,
  weekRange,
  onPreviousWeek,
  onNextWeek,
}: AttorneyCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Attorney Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-[#49306e] text-white flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-900">{name}</h3>
          <p className="text-gray-600 font-medium">{title}</p>
          <p className="text-sm text-gray-500">{specialization}</p>
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-700">Available Time Slots</h4>
          {/* Week Selector */}
          <div className="flex items-center gap-2 bg-[#febd11] rounded-full px-3 py-1">
            <button
              onClick={onPreviousWeek}
              className="text-[#49306e] hover:text-[#382450] transition"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-[#49306e] min-w-[80px] text-center">
              {weekRange}
            </span>
            <button
              onClick={onNextWeek}
              className="text-[#49306e] hover:text-[#382450] transition"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(name, slot, getDayOfWeek(slot.time))}
              className={`px-4 py-3 rounded-md border-2 font-medium transition-all duration-200 ${
                selectedSlotId === slot.id
                  ? "bg-[#febd11] border-[#febd11] text-[#49306e] shadow-md"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-[#febd11] hover:border-[#febd11] hover:text-[#49306e] hover:shadow-lg"
              }`}
            >
              <div className="text-sm font-semibold">{slot.time}</div>
              <div className="text-xs text-gray-500 mt-1">{slot.duration}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

