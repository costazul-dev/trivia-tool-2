// src/components/DownloadCSV.jsx
import React from 'react';

function DownloadCSV({ data }) {
  const generateCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Rank,Team Name,Score,Tied\n"
      + data.map(team => `${team.rank},${team.name},${team.score},${team.tied ? 'Yes' : 'No'}`).join("\n");
    
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