// src/App.jsx
import React, { useState } from 'react';
import TeamInput from './components/TeamInput';
import RankingList from './components/RankingList';
import DownloadCSV from './components/DownloadCSV';
import './App.css';

function App() {
  const [teams, setTeams] = useState([{ name: '', score: '' }]);
  const [rankings, setRankings] = useState([]);

  const addTeam = () => {
    setTeams([...teams, { name: '', score: '' }]);
  };

  const updateTeam = (index, field, value) => {
    const updatedTeams = [...teams];
    updatedTeams[index][field] = value;
    setTeams(updatedTeams);

    if (index === teams.length - 1 && (field === 'name' || field === 'score')) {
      addTeam();
    }
  };

  const rankTeams = () => {
    const validTeams = teams.filter(team => team.name && team.score);
    const sortedTeams = validTeams.sort((a, b) => b.score - a.score);
    
    let currentRank = 1;
    let currentScore = null;
    let teamsAtCurrentRank = 0;

    const rankedTeams = sortedTeams.map((team, index) => {
      if (team.score !== currentScore) {
        currentRank = index + 1;
        currentScore = team.score;
        teamsAtCurrentRank = 1;
      } else {
        teamsAtCurrentRank++;
      }

      return {
        ...team,
        rank: currentRank,
        tied: teamsAtCurrentRank > 1
      };
    });

    setRankings(rankedTeams);
  };

  return (
    <div className="App">
      <h1>Trivia Score Tracker</h1>
      <TeamInput teams={teams} updateTeam={updateTeam} />
      <button onClick={rankTeams}>Rank</button>
      {rankings.length > 0 && (
        <>
          <RankingList rankings={rankings} />
          <DownloadCSV data={rankings} />
        </>
      )}
    </div>
  );
}

export default App;