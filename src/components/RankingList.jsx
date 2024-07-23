// src/components/RankingList.jsx
import React from 'react';

function RankingList({ rankings }) {
  return (
    <div>
      <h2>Rankings</h2>
      <ul>
        {rankings.map((team, index) => (
          <li key={index}>
            Rank {team.rank}: {team.name} - Score: {team.score}
            {team.tied && " (Tied)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RankingList;