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
      const existingTeamNames = teams.map(t => t.name).filter(Boolean);
      const results = await processDictation(audioBlob, currentRound, existingTeamNames);
      const conflicts = [];
      const netNewTeams = [];
      for (const { name, score } of results) {
        const existing = teams.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          if (String(score) !== existing.round1) {
            conflicts.push({ name: existing.name, existing: existing.round1, incoming: String(score) });
          }
        } else {
          netNewTeams.push({ name, round1: String(score), round2: '' });
        }
      }
      setTeams([...teams, ...netNewTeams]);
      setSetupComplete(true);
      if (conflicts.length > 0) {
        const details = conflicts.map(c => `${c.name}: stored ${c.existing}, dictated ${c.incoming}`).join('; ');
        setDictationWarning(`Score conflict — enter scores manually to resolve: ${details}`);
      }
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
      const conflicts = [];
      for (const { name, score } of results) {
        let idx = updatedTeams.findIndex(t => t.name === name);
        if (idx === -1) {
          idx = updatedTeams.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
        }
        if (idx !== -1) {
          const existing = updatedTeams[idx].round2;
          if (existing && existing !== '' && existing !== String(score)) {
            conflicts.push({ name: updatedTeams[idx].name, existing, incoming: String(score) });
          } else {
            updatedTeams[idx] = { ...updatedTeams[idx], round2: String(score) };
          }
        } else {
          console.warn(`Round 2 dictation: no match found for "${name}"`);
          unmatched.push(name);
        }
      }
      setTeams(updatedTeams);
      const warnings = [];
      if (unmatched.length > 0) {
        warnings.push(`Could not match: ${unmatched.join(', ')}. Enter their scores manually.`);
      }
      if (conflicts.length > 0) {
        const details = conflicts.map(c => `${c.name}: stored ${c.existing}, dictated ${c.incoming}`).join('; ');
        warnings.push(`Score conflict — enter scores manually to resolve: ${details}`);
      }
      if (warnings.length > 0) {
        setDictationWarning(warnings.join(' | '));
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
      <h1>Trivia Tool</h1>
      <p className="app-subtitle">Score Manager v1.2 &nbsp;·&nbsp; Round {currentRound}</p>

      {!setupComplete ? (
        <div>
          <InitialTeamSetup onSetupComplete={setupInitialTeams} />
          {currentRound === 1 && (
            <div className="dictate-section">
              <p>Or dictate scores by voice</p>
              {dictationError && (
                <div className="dictation-banner dictation-banner--error">
                  <span>{dictationError}</span>
                  <button className="dictation-banner__close" onClick={() => setDictationError(null)} aria-label="Dismiss">×</button>
                </div>
              )}
              <DictateButton onRecordingComplete={handleDictationComplete} onError={setDictationError} />
              {isDictating && <p className="processing-text">Processing audio…</p>}
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
            <button onClick={addTeam} className="add-team" title="Add team">&#43;</button>
            <button onClick={removeTeam} className="remove-team" title="Remove team">&#8722;</button>
          </div>

          {currentRound === 1 && (
            <div className="dictate-section">
              <p>Dictate scores by voice</p>
              <DictateButton onRecordingComplete={handleDictationComplete} onError={setDictationError} />
              {isDictating && <p className="processing-text">Processing audio…</p>}
            </div>
          )}
          {currentRound === 2 && (
            <div className="dictate-section">
              <p>Dictate round 2 scores by voice</p>
              <DictateButton onRecordingComplete={handleRound2DictationComplete} onError={setDictationError} />
              {isDictating && <p className="processing-text">Processing audio…</p>}
            </div>
          )}

          <div>
            <button className="btn-primary" onClick={rankTeams} disabled={isDictating}>
              {isDictating ? 'Processing…' : 'Rank Teams'}
            </button>
            {currentRound === 1 && round1Rankings.length > 0 && (
              <button className="btn-primary" onClick={startRound2}>Start Round 2</button>
            )}
          </div>

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
