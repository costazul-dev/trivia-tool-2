// src/components/DownloadCSV.jsx
import React from 'react';

function DownloadCSV({ round1Data, round2Data, currentRound }) {
  const generateCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Round 1\nRank,Team Name,Score\n";
    csvContent += round1Data.map(team => `${team.rank},${team.name},${team.score}`).join("\n");

    if (currentRound === 2) {
      csvContent += "\n\nRound 2\nRank,Team Name,Round 2 Score,Total Score\n";
      csvContent += round2Data.map(team => `${team.rank},${team.name},${team.score},${team.totalScore}`).join("\n");
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trivia_rankings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={generateCSV}>Download CSV</button>
  );
}

export default DownloadCSV;