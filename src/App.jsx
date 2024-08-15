// src/App.jsx
import React, { useState } from 'react';
import InitialTeamSetup from './components/InitialTeamSetup';
import TeamInput from './components/TeamInput';
import RankingList from './components/RankingList/RankingList';
import DownloadCSV from './components/DownloadCSV';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);
  const [round1Rankings, setRound1Rankings] = useState([]);
  const [round2Rankings, setRound2Rankings] = useState([]);
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
    if (currentRound === 1) {
      const validTeams = teams.filter(team => team.name && team.round1);
      const sortedTeams = validTeams.sort((a, b) => parseFloat(b.round1) - parseFloat(a.round1));

      let currentRank = 1;
      let currentScore = null;
      let teamsAtCurrentRank = 0;

      const rankedTeams = sortedTeams.map((team, index) => {
        const score = parseFloat(team.round1);
        if (score !== currentScore) {
          currentRank = index + 1;
          currentScore = score;
          teamsAtCurrentRank = 1;
        } else {
          teamsAtCurrentRank++;
        }

        return {
          ...team,
          rank: currentRank,
          tied: teamsAtCurrentRank > 1,
          score: score
        };
      });

      setRound1Rankings(rankedTeams);
    } else {
      const validTeams = teams.filter(team => team.name && (team.round1 || team.round2));
      const sortedTeams = validTeams.sort((a, b) => {
        const scoreA = parseFloat(a.round1 || 0) + parseFloat(a.round2 || 0);
        const scoreB = parseFloat(b.round1 || 0) + parseFloat(b.round2 || 0);
        return scoreB - scoreA;
      });

      let currentRank = 1;
      let currentScore = null;
      let teamsAtCurrentRank = 0;

      const rankedTeams = sortedTeams.map((team, index) => {
        const totalScore = parseFloat(team.round1 || 0) + parseFloat(team.round2 || 0);
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
          score: parseFloat(team.round2 || 0),
          totalScore
        };
      });

      setRound2Rankings(rankedTeams);
    }
  };

  const startRound2 = () => {
    setCurrentRound(2);
  };

  return (
    <div className="App">
      <h1>trivia-tool-2 v1.2 🎙️</h1>
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
            {currentRound === 1 && round1Rankings.length > 0 && (
              <button onClick={startRound2}>Start Round 2</button>
            )}
            {(round1Rankings.length > 0 || round2Rankings.length > 0) && (
            <>
                <RankingList
                  round1Rankings={round1Rankings}
                  round2Rankings={round2Rankings}
                  currentRound={currentRound}
                />
                <DownloadCSV
                  round1Data={round1Rankings}
                  round2Data={round2Rankings}
                  currentRound={currentRound}
                />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;