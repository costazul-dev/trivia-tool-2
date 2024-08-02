// src/components/RankingList.jsx
import React from 'react';

function RankingList({ rankings, currentRound }) {
  return (
    <div>
      <h2>Rankings</h2>
      <ul>
        {rankings.map((team, index) => (
          <li key={index}>
            Rank {team.rank}: {team.name} - 
            Round 1: {team.round1 || 0}
            {currentRound === 2 && `, Round 2: ${team.round2 || 0}`}
            {` - Total: ${team.totalScore}`}
            {team.tied && " (Tied)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RankingList;