import React /*, { useState }*/ from 'react'; 
// Commented out useState because it's not used in this component, but it may be needed later

import style from './timeslots.module.css';

interface Props {
  slots: string[] | null;
  selectedTime: string | null;
  setSelectedTime: (date: string | null) => void;
}

const TimeSlots = ({ slots,selectedTime, setSelectedTime }: Props) => {
  
  // Handle the selection of a time slot
  const handleSelect = (slot: string) => {
    // If the clicked slot is already selected, unselect it
    if (selectedTime === slot) {
      setSelectedTime(null);
    } else {
      setSelectedTime(slot);
    }
  };
  

  return (
    <div className={style.timeslots}>
  {selectedTime && <div>{`Selected time: ${selectedTime}`}</div>}

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
