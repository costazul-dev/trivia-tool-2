function extensionForMime(mime) {
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('ogg')) return 'ogg';
  return 'webm';
}

export async function processDictation(audioBlob, round, existingTeams) {
  // Step 1: Transcribe audio
  const ext = extensionForMime(audioBlob.type);
  const formData = new FormData();
  formData.append('audio', audioBlob, `recording.${ext}`);
  if (existingTeams && existingTeams.length > 0) {
    formData.append('teamNames', existingTeams.join(','));
  }

  const transcribeRes = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!transcribeRes.ok) {
    await transcribeRes.json().catch(() => ({}));
    throw new Error('Transcription failed. Check your internet connection and try again.');
  }

  const { transcript } = await transcribeRes.json();
  console.log('[dictation] Transcript:', transcript);

  // Step 2: Parse transcript into team/score pairs
  console.log('[dictation] Parsing transcript for round', round);
  const parseRes = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, round, existingTeams }),
  });

  if (!parseRes.ok) {
    await parseRes.json().catch(() => ({}));
    throw new Error('Could not parse the transcript. Try dictating again more slowly.');
  }

  const parsed = await parseRes.json();
  console.log('[dictation] Parsed results:', parsed);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('No teams or scores detected. Make sure to say each team name followed by their score.');
  }

  return parsed;
}
