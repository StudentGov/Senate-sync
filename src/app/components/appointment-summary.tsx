interface AppointmentSummaryProps {
  date: string;
  time: string;
  attorney: string;
  duration: string;
  onConfirm: () => void;
}

export const AppointmentSummary = ({
  date,
  time,
  attorney,
  duration,
  onConfirm,
}: AppointmentSummaryProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h3 className="font-bold text-xl text-gray-900 mb-6">Appointment Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
          <p className="text-gray-900 font-semibold">{date}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Time</p>
          <p className="text-gray-900 font-semibold">{time}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Attorney</p>
          <p className="text-gray-900 font-semibold">{attorney}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
          <p className="text-gray-900 font-semibold">{duration}</p>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full bg-[#febd11] text-[#49306e] py-3 rounded-md font-bold hover:bg-[#fdd14d] transition-colors"
      >
        Confirm Appointment
      </button>
    </div>
  );
};

