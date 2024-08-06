// src/App.jsx
import React, { useState } from 'react';
import InitialTeamSetup from './components/InitialTeamSetup';
import TeamInput from './components/TeamInput';
import RankingList from './components/RankingList/RankingList';
import DownloadCSV from './components/DownloadCSV';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);

  const setupInitialTeams = (numberOfTeams) => {
    const initialTeams = Array(numberOfTeams).fill().map(() => ({ name: '', round1: '', round2: '' }));
    setTeams(initialTeams);
    setSetupComplete(true);
  };

  const addTeam = () => {
    setTeams([...teams, { name: '', round1: '', round2: '' }]);
  };

  const removeTeam = () => {
    if (teams.length > 1) {
      setTeams(teams.slice(0, -1));
    }
  };

  const updateTeam = (index, field, value) => {
    const updatedTeams = [...teams];
    if (field === 'round1' && currentRound !== 1) return;
    updatedTeams[index][field] = value;
    setTeams(updatedTeams);
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
        totalScore,
        round1: parseInt(team.round1 || 0),
        round2: parseInt(team.round2 || 0)
      };
    });

    setRankings(rankedTeams);
  };

  const startRound2 = () => {
    setCurrentRound(2);
  };

  return (
    <div className="App">
      <h1>trivia-tool-2 beta 🎙️</h1>
      {!setupComplete ? (
        <InitialTeamSetup onSetupComplete={setupInitialTeams} />
      ) : (
        <>
          <TeamInput 
            teams={teams} 
            updateTeam={updateTeam} 
            currentRound={currentRound}
          />
          <div className="team-control-buttons">
            <button onClick={addTeam} className="add-team">&#43;</button>
            <button onClick={removeTeam} className="remove-team">&#8722;</button>
          </div>
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
        </>
      )}
    </div>
  );
}

export default App;