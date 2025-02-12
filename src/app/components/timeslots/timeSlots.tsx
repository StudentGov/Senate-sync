import React, { useState } from 'react';
import style from './timeslots.module.css';

interface Props {
  slots: string[] | null;
  setSelectedTime: (date: string | null) => void;
}

const TimeSlots = ({ slots, setSelectedTime }: Props) => {
  const [selectedTime, setSelectedTimeState] = useState<string | null>(null);
  
  // Handle the selection of a time slot
  const handleSelect = (slot: string) => {
    setSelectedTimeState(slot);  // Update the selected time
    setSelectedTime(slot);  // Call the parent component's function
  };

  return (
    <div className={style.timeslots}>
      {`Selected time: ${selectedTime}`}
      {slots ?
        slots.map((slot, index) => (
          <button
            key={index}
            className={`${style.time} ${selectedTime === slot ? style.selected : ''}`} // Conditionally apply "selected" class
            onClick={() => handleSelect(slot)}
          >
            {slot}
          </button>
        )): <h2>No Available time slots</h2>}
    </div>
  );
};

export default TimeSlots;
