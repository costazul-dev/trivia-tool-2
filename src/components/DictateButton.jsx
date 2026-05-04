import React, { useState, useRef, useCallback, useEffect } from 'react';

function getSupportedMimeType() {
  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  }
  return '';
}

function DictateButton({ onRecordingComplete, onError }) {
  const [state, setState] = useState('idle'); // 'idle' | 'recording' | 'processing'
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [stopTimer]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        setState('processing');
        Promise.resolve(onRecordingComplete(blob)).finally(() => {
          setState('idle');
        });
      };

      recorder.start();
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
      setState('recording');
    } catch (err) {
      console.error('Microphone access denied:', err);
      if (onError) onError('Microphone access denied. Check your browser permissions.');
    }
  };

  const stopRecording = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClick = () => {
    if (state === 'idle') startRecording();
    else if (state === 'recording') stopRecording();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <button
      className={`dictate-btn ${state}`}
      onClick={handleClick}
      disabled={state === 'processing'}
    >
      {state === 'idle' && (
        <>
          <span className="mic-icon" aria-hidden="true">🎤</span>
          {' Dictate Scores'}
        </>
      )}
      {state === 'recording' && (
        <>
          <span className="recording-dot" />
          {` Recording ${formatTime(elapsed)} — tap to stop`}
        </>
      )}
      {state === 'processing' && 'Processing…'}
    </button>
  );
}

export default DictateButton;
