// src/components/TeamInput.jsx
import React from 'react';

function TeamInput({ teams, updateTeam, currentRound }) {
  return (
    <div>
      {teams.map((team, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Team Name"
            value={team.name}
            onChange={(e) => updateTeam(index, 'name', e.target.value)}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Round 1 Score"
            value={team.round1}
            onChange={(e) => updateTeam(index, 'round1', e.target.value)}
            disabled={currentRound !== 1}
          />
          {currentRound === 2 && (
            <input
              type="number"
              step="0.1"
              placeholder="Round 2 Score"
              value={team.round2}
              onChange={(e) => updateTeam(index, 'round2', e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default TeamInput;