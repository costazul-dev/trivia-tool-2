// src/components/RankingList.jsx
import React from 'react';
import './RankingList.css';

function rankClass(rank) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return '';
}

function RankingList({ round1Rankings, round2Rankings, currentRound }) {
  const renderRound1Table = () => (
    <table className="rankings-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {round1Rankings.map((team, index) => (
          <tr key={index} className={rankClass(team.rank)}>
            <td className="rank-cell">{team.rank}</td>
            <td>{team.name}</td>
            <td>{team.score.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderRound2Table = () => (
    <table className="rankings-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {round2Rankings.map((team, index) => (
          <tr key={index} className={rankClass(team.rank)}>
            <td className="rank-cell">{team.rank}</td>
            <td>{team.name}</td>
            <td>{team.totalScore.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="rankings-container">
      <h2>Round 1 Rankings</h2>
      {renderRound1Table()}
      {currentRound === 2 && (
        <>
          <h2>Round 2 Rankings</h2>
          {renderRound2Table()}
        </>
      )}
    </div>
  );
}

export default RankingList;
