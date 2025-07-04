// Pomodoro.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase-client.js';
import ParkIcon from '@mui/icons-material/Park';

const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long10: 10 * 60,
  long15: 15 * 60,
};

const Pomodoro = () => {
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES['pomodoro']);
  const [isRunning, setIsRunning] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const addActivityLogs = async (activity, start_time, end_time) => {
    const { error } = await supabase
      .from('activities')
      .insert([{ activity, start_time, end_time }]);
    if (error) console.error("Insert error:", error.message);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    }
    if (isRunning && timeLeft === 0) {
      handleComplete();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleComplete = async () => {
    setIsRunning(false);
    const endTime = new Date();
    if (startTime) {
      await addActivityLogs(`${taskName || 'Pomodoro Task'} - ${mode}`, startTime.toISOString(), endTime.toISOString());
    }
    alert("Pomodoro session complete!");
  };

  const handleStart = () => {
    if (!taskName.trim()) return alert("Enter a task name.");
    setStartTime(new Date());
    setIsRunning(true);
  };

  const switchMode = (selectedMode) => {
    setMode(selectedMode);
    setTimeLeft(MODES[selectedMode]);
    setIsRunning(false);
    setTaskName('');
    setStartTime(null);
  };

  return (
    <div className="pomodoro-wrapper">
      <span className="title-flex">
        <ParkIcon className="tree-icon" sx={{ fontSize: 50 }} />
        Focus Time
      </span>
      <div className="modes">
        {Object.keys(MODES).map((m) => (
          <button
            key={m}
            className={`mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => switchMode(m)}
          >
            {m === 'pomodoro' ? 'Pomodoro' : `Break (${MODES[m] / 60}m)`}
          </button>
        ))}
      </div>

      <input
        className="task-input"
        placeholder="🌼 What are you working on?"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />

      <div className="circle-timer">
        <div className="circle-timer-inner">
          <span>{formatTime(timeLeft)}</span>
        </div>
        <div className="pomo-controls">
          {!isRunning ? (
            <button onClick={handleStart} className='controls-start'>Start</button>
          ) : (
            <button onClick={() => setIsRunning(false)}>Pause</button>
          )}
          <div className="controls-reset">
            <button onClick={() => {
              setIsRunning(false);
              setTimeLeft(MODES[mode]);
              setStartTime(null);
            }}>Reset</button>
            <button onClick={handleComplete}>Stop & Save</button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Pomodoro;
