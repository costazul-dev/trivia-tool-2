// src/components/TeamInput.jsx
import React from 'react';

function TeamInput({ teams, updateTeam }) {
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
            placeholder="Score"
            value={team.score}
            onChange={(e) => updateTeam(index, 'score', e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default TeamInput;