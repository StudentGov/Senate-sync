import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeSlot {
  id: string;
  slotId: number;
  time: string;
  duration: string;
  date: string;
  isAvailable: boolean;
}

interface AttorneyCardProps {
  attorneyId: string;
  initials: string;
  name: string;
  title: string;
  specialization: string;
  timeSlots: TimeSlot[];
  onSelectSlot: (attorneyId: string, attorneyName: string, slot: TimeSlot, dayOfWeek: number) => void;
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

// Helper to check if a slot is in the past
function isSlotPast(slot: TimeSlot): boolean {
  try {
    // Parse date string (YYYY-MM-DD)
    const [year, month, day] = slot.date.split("-").map(Number);
    
    // Parse time string (format: "Mon 9:00 AM" or "Fri 01:00 PM")
    const timePart = slot.time.split(" ").slice(1).join(" "); // Get "9:00 AM" or "01:00 PM"
    const [timeStr, modifier] = timePart.trim().split(" ");
    const [hours, minutes] = timeStr.split(":").map(Number);
    
    let hours24 = hours;
    if (modifier === "PM" && hours !== 12) hours24 += 12;
    if (modifier === "AM" && hours === 12) hours24 = 0;
    
    const slotDateTime = new Date(year, month - 1, day, hours24, minutes, 0, 0);
    const now = new Date();
    
    return slotDateTime.getTime() < now.getTime();
  } catch (error) {
    console.error("Error checking if slot is past:", error, slot);
    return false;
  }
}

export const AttorneyCard = ({
  attorneyId,
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
          {specialization && <p className="text-sm text-gray-500">{specialization}</p>}
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
        {timeSlots.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">
            No available time slots for this week
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => {
              const isPast = isSlotPast(slot);
              const isUnavailable = !slot.isAvailable || isPast;
              
              return (
                <button
                  key={slot.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isUnavailable) {
                      onSelectSlot(attorneyId, name, slot, getDayOfWeek(slot.time));
                    }
                  }}
                  disabled={isUnavailable}
                  className={`px-4 py-3 rounded-md border-2 font-medium transition-all duration-200 ${
                    isUnavailable
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                      : selectedSlotId === slot.id
                      ? "bg-[#febd11] border-[#febd11] text-[#49306e] shadow-md"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-[#febd11] hover:border-[#febd11] hover:text-[#49306e] hover:shadow-lg"
                  }`}
                  title={
                    isPast 
                      ? "This time slot has already passed" 
                      : !slot.isAvailable 
                      ? "This time slot is already booked" 
                      : ""
                  }
                >
                  <div className="text-sm font-semibold">{slot.time}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {isPast ? "Past" : slot.isAvailable ? slot.duration : "Booked"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

