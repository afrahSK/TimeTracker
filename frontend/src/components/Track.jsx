import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase-client.js'
import Navbar from './Navbar.jsx';
const Track = () => {
  const [session, setSession] = useState(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession()
    console.log(currentSession);
    setSession(currentSession.data.session);
  }
  useEffect(() => {
    fetchSession();
  }
    , [])



  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);

  // stopwatch
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalIdRef = useRef(null);
  const startTimeref = useRef(0);

  useEffect(() => {
    if (isRunning) {
      intervalIdRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeref.current)
      }, 10)
    }
    return () => {
      clearInterval(intervalIdRef.current);
    }
  }, [isRunning])

  const handleStart = () => {
    if (!activity.trim()) return;
    setStartTime(new Date());
    setIsRunning(true);
    startTimeref.current = Date.now() - elapsedTime;
  };

  const handleStop = () => {
    if (!startTime) return;
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2); // in minutes
    const newLog = {
      task: activity,
      start: startTime.toLocaleTimeString(),
      end: endTime.toLocaleTimeString(),
      duration,
    };
    setLogs([newLog, ...logs]);
    setActivity('');
    setStartTime(null);
    setIsRunning(false);

  };

  const handlePause = () => {
    setIsRunning(false);
  }
  const handleResume = () => {
    setIsRunning(true);
  }
  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
    setStartTime(null);
    setIsRunning(false);
    setActivity('');
  }
  const formatTime = () => {
    let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
    let seconds = Math.floor(elapsedTime / (1000) % 60)

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }
  return (
    <>
      {!session ? (<>
        <div>Login first</div>
      </>
      ) : (
        <>
          <div className="track-container">
            <div className='title'>
              Start an Activity
            </div>
            <div className="track-inputs">
              <input
                type="text"
                className="inp-task"
                placeholder="What are you working on?"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
              {!startTime ? (
                <button className="btn-start" onClick={handleStart}>
                  Start
                </button>
              ) : (
                <>
                </>
              )}
            </div>
            <div>
              {
                startTime ? (
                  <>
                    <div className='stopwatch'>
                      <div className="display">
                        {formatTime()}
                      </div>
                      <div className="controls">
                        <button className="btn-stop" onClick={handleStop}>
                          Stop
                        </button>
                        {
                          isRunning ? (
                            <button className="btn-stop" onClick={handlePause}>Pause</button>
                          ) : (
                            <button className="btn-stop" onClick={handleResume}>Resume</button>
                          )
                        }
                        <button className="btn-stop" onClick={handleReset}>Reset</button>
                      </div>
                    </div>
                  </>
                ) : (null)
              }
            </div>
            <div className="track-logs">
              <h3>Activity Logs</h3>
              {logs.length === 0 ? (
                <p className="no-logs">No activities tracked yet.</p>
              ) : (
                <ul>
                  {logs.map((log, index) => (
                    <li key={index}>
                      <strong>{log.task}</strong><br />
                      {log.start} → {log.end} ({log.duration} mins)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )
      }

    </>
  );
};

export default Track;
