// src/components/InitialTeamSetup.jsx
import React, { useState } from 'react';

function InitialTeamSetup({ onSetupComplete }) {
  const [numberOfTeams, setNumberOfTeams] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(numberOfTeams);
    if (num > 0) {
      onSetupComplete(num);
    } else {
      alert('Please enter a valid number of teams');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="numberOfTeams">Number of Teams: </label>
      <input
        type="number"
        id="numberOfTeams"
        value={numberOfTeams}
        onChange={(e) => setNumberOfTeams(e.target.value)}
        min="1"
        required
      />
      <button type="submit">Set Up Teams</button>
    </form>
  );
}

export default InitialTeamSetup;