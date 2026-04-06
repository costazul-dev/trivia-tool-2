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

  const transcribeRes = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!transcribeRes.ok) {
    const err = await transcribeRes.json().catch(() => ({}));
    throw new Error(err.error || `Transcription failed (HTTP ${transcribeRes.status})`);
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
    const err = await parseRes.json().catch(() => ({}));
    throw new Error(err.error || 'Parsing failed');
  }

  const parsed = await parseRes.json();
  console.log('[dictation] Parsed results:', parsed);
  return parsed;
}
