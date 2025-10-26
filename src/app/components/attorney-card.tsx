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
  onSelectSlot: (attorney: string, slot: TimeSlot) => void;
  selectedSlotId?: string;
}

export const AttorneyCard = ({
  initials,
  name,
  title,
  specialization,
  timeSlots,
  onSelectSlot,
  selectedSlotId,
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
        <h4 className="font-semibold text-gray-700 mb-3">Available Time Slots</h4>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(name, slot)}
              className={`px-4 py-3 rounded-md border-2 font-medium transition-all duration-200 ${
                selectedSlotId === slot.id
                  ? "bg-[#febd11] border-[#febd11] text-[#49306e] shadow-md"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-[#febd11] hover:border-[#febd11] hover:text-[#49306e] hover:shadow-lg"
              }`}
            >
              <div className="text-sm">{slot.time}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

