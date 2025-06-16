import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase-client.js';

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
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
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

  const switchMode = (selectedMode) => {
    setMode(selectedMode);
    setTimeLeft(MODES[selectedMode]);
    setIsRunning(false);
    setTaskName('');
    setStartTime(null);
  };

  const handleStart = () => {
    if (!taskName.trim()) return alert("Enter a task name.");
    setStartTime(new Date());
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode]);
    setStartTime(null);
  };

  const handleStop = async () => {
    setIsRunning(false);
    const endTime = new Date();
    if (startTime) {
      await addActivityLogs(`${taskName || 'Pomodoro Task'} - ${mode}`, startTime.toISOString(), endTime.toISOString());
    }
    handleReset();
  };

  return (
    <div>
      <h2 className="fade-in pomo-header">Stay focused using Pomodoro. </h2>
      <div className="pomodoro-container">

      <div className="mode-selector fade-in">
        {['pomodoro', 'short', 'long10', 'long15'].map((m) => (
          <button
            key={m}
            className={mode === m ? 'active' : ''}
            onClick={() => switchMode(m)}
          >
            {m === 'pomodoro' ? 'Pomodoro' : `Break (${MODES[m] / 60}m)`}
          </button>
        ))}
      </div>

      <input
        className="task-input fade-in"
        placeholder="What task are you working on?"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />

      <div className="timer-circle fade-in">
        <div className="circle">
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="timer-controls fade-in">
        {!isRunning ? (
          <button onClick={handleStart}>Start</button>
        ) : (
          <button onClick={handlePause}>Pause</button>
        )}
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleStop}>Stop & Log</button>
      </div>
    </div>
    </div>
  );
};

export default Pomodoro;
