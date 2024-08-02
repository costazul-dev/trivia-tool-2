// src/App.jsx
import React, { useState } from 'react';
import TeamInput from './components/TeamInput';
import RankingList from './components/RankingList';
import DownloadCSV from './components/DownloadCSV';
import './App.css';

function App() {
  const [teams, setTeams] = useState([{ name: '', round1: '', round2: '' }]);
  const [rankings, setRankings] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);

  const addTeam = () => {
    setTeams([...teams, { name: '', round1: '', round2: '' }]);
  };

  const updateTeam = (index, field, value) => {
    const updatedTeams = [...teams];
    // Only allow updates to round1 if we're still in round 1
    if (field === 'round1' && currentRound !== 1) return;
    updatedTeams[index][field] = value;
    setTeams(updatedTeams);

    if (index === teams.length - 1 && field === 'name') {
      addTeam();
    }
  };

  const rankTeams = () => {
    const validTeams = teams.filter(team => team.name && (team.round1 || team.round2));
    const sortedTeams = validTeams.sort((a, b) => {
      const scoreA = parseInt(a.round1 || 0) + parseInt(a.round2 || 0);
      const scoreB = parseInt(b.round1 || 0) + parseInt(b.round2 || 0);
      return scoreB - scoreA;
    });
    
    let currentRank = 1;
    let currentScore = null;
    let teamsAtCurrentRank = 0;

    const rankedTeams = sortedTeams.map((team, index) => {
      const totalScore = parseInt(team.round1 || 0) + parseInt(team.round2 || 0);
      if (totalScore !== currentScore) {
        currentRank = index + 1;
        currentScore = totalScore;
        teamsAtCurrentRank = 1;
      } else {
        teamsAtCurrentRank++;
      }

      return {
        ...team,
        rank: currentRank,
        tied: teamsAtCurrentRank > 1,
        totalScore
      };
    });

    setRankings(rankedTeams);
  };

  const startRound2 = () => {
    setCurrentRound(2);
  };

  return (
    <div className="App">
      <h1>Trivia Score Tracker</h1>
      <TeamInput 
        teams={teams} 
        updateTeam={updateTeam} 
        currentRound={currentRound}
      />
      <button onClick={rankTeams}>Rank Teams</button>
      {currentRound === 1 && rankings.length > 0 && (
        <button onClick={startRound2}>Start Round 2</button>
      )}
      {rankings.length > 0 && (
        <>
          <RankingList rankings={rankings} currentRound={currentRound} />
          <DownloadCSV data={rankings} currentRound={currentRound} />
        </>
      )}
    </div>
  );
}

export default App;