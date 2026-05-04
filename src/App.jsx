// src/App.jsx
import React, { useState } from 'react';
import InitialTeamSetup from './components/InitialTeamSetup';
import TeamInput from './components/TeamInput';
import RankingList from './components/RankingList/RankingList';
import DownloadCSV from './components/DownloadCSV';
import DictateButton from './components/DictateButton';
import { processDictation } from './services/dictation';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);
  const [round1Rankings, setRound1Rankings] = useState([]);
  const [round2Rankings, setRound2Rankings] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [dictationError, setDictationError] = useState(null);
  const [dictationWarning, setDictationWarning] = useState(null);

  const handleDictationComplete = async (audioBlob) => {
    setIsDictating(true);
    setDictationError(null);
    setDictationWarning(null);
    try {
      const results = await processDictation(audioBlob, currentRound, teams.map(t => t.name).filter(Boolean));
      const newTeams = results.map(({ name, score }) => ({
        name,
        round1: String(score),
        round2: '',
      }));
      setTeams(newTeams);
      setSetupComplete(true);
    } catch (err) {
      console.error('Dictation failed:', err);
      setDictationError(err.message);
    } finally {
      setIsDictating(false);
    }
  };

  const handleRound2DictationComplete = async (audioBlob) => {
    setIsDictating(true);
    setDictationError(null);
    setDictationWarning(null);
    try {
      const existingTeamNames = teams.map(t => t.name).filter(Boolean);
      const results = await processDictation(audioBlob, 2, existingTeamNames);
      const updatedTeams = [...teams];
      const unmatched = [];
      for (const { name, score } of results) {
        let idx = updatedTeams.findIndex(t => t.name === name);
        if (idx === -1) {
          idx = updatedTeams.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
        }
        if (idx !== -1) {
          updatedTeams[idx] = { ...updatedTeams[idx], round2: String(score) };
        } else {
          console.warn(`Round 2 dictation: no match found for "${name}"`);
          unmatched.push(name);
        }
      }
      setTeams(updatedTeams);
      if (unmatched.length > 0) {
        setDictationWarning(`Could not match: ${unmatched.join(', ')}. Enter their scores manually.`);
      }
    } catch (err) {
      console.error('Dictation failed:', err);
      setDictationError(err.message);
    } finally {
      setIsDictating(false);
    }
  };

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
        <div>
          <InitialTeamSetup onSetupComplete={setupInitialTeams} />
          {currentRound === 1 && (
            <div className="dictate-section">
              <p>Or dictate scores by voice:</p>
              {dictationError && (
                <div className="dictation-banner dictation-banner--error">
                  <span>{dictationError}</span>
                  <button className="dictation-banner__close" onClick={() => setDictationError(null)} aria-label="Dismiss">×</button>
                </div>
              )}
              <DictateButton onRecordingComplete={handleDictationComplete} onError={setDictationError} />
              {isDictating && <p className="processing-text">Processing audio...</p>}
            </div>
          )}
        </div>
      ) : (
        <>
          {dictationError && (
            <div className="dictation-banner dictation-banner--error">
              <span>{dictationError}</span>
              <button className="dictation-banner__close" onClick={() => setDictationError(null)} aria-label="Dismiss">×</button>
            </div>
          )}
          {dictationWarning && (
            <div className="dictation-banner dictation-banner--warning">
              <span>{dictationWarning}</span>
              <button className="dictation-banner__close" onClick={() => setDictationWarning(null)} aria-label="Dismiss">×</button>
            </div>
          )}
          <TeamInput
            teams={teams}
            updateTeam={updateTeam}
            currentRound={currentRound}
          />
          <div className="team-control-buttons">
            <button onClick={addTeam} className="add-team">&#43;</button>
            <button onClick={removeTeam} className="remove-team">&#8722;</button>
          </div>
          {currentRound === 1 && (
            <>
              <DictateButton onRecordingComplete={handleDictationComplete} onError={setDictationError} />
              {isDictating && <p className="processing-text">Processing audio...</p>}
            </>
          )}
          {currentRound === 2 && (
            <>
              <DictateButton onRecordingComplete={handleRound2DictationComplete} onError={setDictationError} />
              {isDictating && <p className="processing-text">Processing audio...</p>}
            </>
          )}
          <button onClick={rankTeams} disabled={isDictating}>
            {isDictating ? 'Processing...' : 'Rank Teams'}
          </button>
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