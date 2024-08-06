// src/components/RankingList.jsx
import React from 'react';
import './RankingList.css';

function RankingList({ rankings, currentRound }) {
  const renderTable = (round) => (
    <table className="rankings-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Team Name</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {rankings.map((team, index) => (
          <tr key={index}>
            <td>{team.rank}</td>
            <td>{team.name}</td>
            <td>{round === 1 ? team.round1 : team.totalScore}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="rankings-container">
      <h2>Rankings</h2>
      {renderTable(1)}
      {currentRound === 2 && (
        <>
          <h3>Round 2 Totals</h3>
          {renderTable(2)}
        </>
      )}
    </div>
  );
}

export default RankingList;