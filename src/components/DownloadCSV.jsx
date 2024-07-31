// src/components/DownloadCSV.jsx
import React from 'react';

function DownloadCSV({ data, currentRound }) {
  const generateCSV = () => {
    const headers = currentRound === 1 
      ? "Rank,Team Name,Round 1 Score,Total Score,Tied\n"
      : "Rank,Team Name,Round 1 Score,Round 2 Score,Total Score,Tied\n";

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers
      + data.map(team => 
          `${team.rank},${team.name},${team.round1 || 0},${currentRound === 2 ? `${team.round2 || 0},` : ''}${team.totalScore},${team.tied ? 'Yes' : 'No'}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trivia_rankings_round_${currentRound}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={generateCSV}>Download CSV</button>
  );
}

export default DownloadCSV;