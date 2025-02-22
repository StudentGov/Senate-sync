import React, { useState } from 'react';
import style from './Timeslots.module.css';

interface Props {
  slots: string[] | null;
  selectedTime: string | null;
  setSelectedTime: (date: string | null) => void;
}

const TimeSlots = ({ slots,selectedTime, setSelectedTime }: Props) => {
  
  // Handle the selection of a time slot
  const handleSelect = (slot: string) => {
    setSelectedTime(slot);  // Update the selected time
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
