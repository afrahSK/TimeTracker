import React, { useState, useEffect, useRef, useContext } from 'react';
import { supabase } from '../supabase-client.js';
import { TimerContext } from '../context/TimerContext.js';

const IDLE_TIMEOUT = 2 * 60 * 1000; // 5 minutes in milliseconds

const Track = () => {
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef(null);
  const audioRef = useRef(null);

  const {
    activity,
    setActivity,
    selectedProject,
    setSelectedProject,
    isRunning,
    startTime,
    elapsedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useContext(TimerContext);

  // Function to reset the idle timer
  const resetIdleTimer = () => {
    clearTimeout(idleTimer.current);
    if (isRunning) {
      setIsIdle(false);
      idleTimer.current = setTimeout(() => {
        setIsIdle(true);
        // Play a sound when the user becomes idle
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, IDLE_TIMEOUT);
    }
  };

  // Add event listeners for user activity
  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [isRunning]);

  // Start the idle timer when the main timer starts
  useEffect(() => {
    if (isRunning) {
      resetIdleTimer();
    } else {
      clearTimeout(idleTimer.current);
    }
  }, [isRunning]);


  // for supabase realtime sync
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('realtime:activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Realtime payload:', payload);
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);



  // Fetch user session
  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    setSession(currentSession.data.session);
  };

  // Fetch activity logs
  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('id, activity, start_time, end_time, project_id, projects(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
    } else {
      const formatted = data.map(log => ({
        task: log.activity,
        start: new Date(log.start_time).toLocaleTimeString(),
        end: new Date(log.end_time).toLocaleTimeString(),
        duration: formatDuration(new Date(log.end_time) - new Date(log.start_time)),
        projectName: log.projects?.name || 'No Project'
      }));
      setLogs(formatted);
    }
  };

  // Insert new activity log
  const addActivityLogs = async (activity, start_time, end_time) => {
    const { data, error } = await supabase
      .from('activities')
      .insert([{ activity, start_time, end_time, project_id: selectedProject || null, user_id: session.user.id }]);
    if (error) {
      console.error("Insert error:", error.message);
    } else {
      console.log("Activity added:", data);
    }
  };


  useEffect(() => {
    fetchSession();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (session) fetchProjects();
  }, [session]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id);
    if (error) console.error(error.message);
    else setProjects(data);
  };


  const handleStop = async () => {
    if (!startTime) return;
    const endTime = new Date();
    const duration = formatDuration(endTime - startTime);
    const newLog = {
      task: activity,
      start: startTime.toLocaleTimeString(),
      end: endTime.toLocaleTimeString(),
      duration,
    };
    setLogs([newLog, ...logs]);
    await addActivityLogs(activity, startTime.toISOString(), endTime.toISOString());
    await fetchLogs();
    resetTimer();
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatTime = () => {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/notify.mp3" />
      {!session ? (
        <div>Login first</div>
      ) : (
        <div className="track-container">
          {isIdle && <div className="idle-warning">You have been idle for 5 minutes.</div>}
          <div className='title'>Start an Activity</div>
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="project-select"
          >
            <option value="">No project</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
          <div className="track-inputs">
            <input
              type="text"
              className="inp-task"
              placeholder="What are you working on?"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
            {!startTime && (
              <button className="btn-start" onClick={startTimer}>
                Start
              </button>
            )}
          </div>

          {startTime && (
            <div className='stopwatch'>
              <div className="display">{formatTime()}</div>
              <div className="controls">
                <button className="btn-stop" onClick={handleStop}>Stop</button>
                {isRunning ? (
                  <button className="btn-stop" onClick={pauseTimer}>Pause</button>
                ) : (
                  <button className="btn-stop" onClick={resumeTimer}>Resume</button>
                )}
                <button className="btn-stop" onClick={resetTimer}>Reset</button>
              </div>
            </div>
          )}

          <div className="track-logs">
            <h3>Activity Logs</h3>
            {logs.length === 0 ? (
              <p className="no-logs">No activities tracked yet.</p>
            ) : (
              <ul>
                {logs.map((log, index) => (
                  <li key={index}>
                    <strong>{log.task}</strong> {log.projectName && <>- <em>{log.projectName}</em></>}<br />
                    {log.start} - {log.end} ({log.duration})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Track;