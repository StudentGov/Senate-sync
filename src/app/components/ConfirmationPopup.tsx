import React, { useState } from 'react';

interface Props {
  onConfirm: (starId: string, techId: string, description: string) => void;
  onCancel: () => void;
}

const ConfirmationPopup: React.FC<Props> = ({ onConfirm, onCancel }) => {
  const [starId, setStarId] = useState('');
  const [techId, setTechId] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (starId && techId && description) {
      onConfirm(starId, techId, description);
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Confirm Appointment</h3>

        <input
          type="text"
          placeholder="StarID"
          value={starId}
          onChange={(e) => setStarId(e.target.value)}
        />
        <input
          type="text"
          placeholder="TechID"
          value={techId}
          onChange={(e) => setTechId(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="popup-buttons">
          <button onClick={handleSubmit} className="yes">Submit</button>
          <button onClick={onCancel} className="no">Cancel</button>
        </div>
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .popup-box {
          background: white;
          padding: 25px;
          border-radius: 10px;
          width: 350px;
          text-align: center;
        }

        input, textarea {
          width: 90%;
          margin: 10px 0;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        textarea {
          resize: vertical;
          min-height: 60px;
        }

        .popup-buttons button {
          margin: 10px;
          padding: 8px 16px;
          cursor: pointer;
        }

        .yes {
          background-color: #4CAF50;
          color: white;
          border: none;
        }

        .no {
          background-color: #f44336;
          color: white;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationPopup;
