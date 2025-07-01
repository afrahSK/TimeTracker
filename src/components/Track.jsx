import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase-client.js';


const Track = () => {
  const [session, setSession] = useState(null);
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalIdRef = useRef(null);
  const startTimeref = useRef(0);
  const pauseTimeref = useRef(0);


  // for projects

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

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
      .insert([{ activity, start_time, end_time, project_id: selectedProject || null }]);
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



  useEffect(() => {
    if (isRunning) {
      intervalIdRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeref.current);
      }, 10);
    }
    return () => clearInterval(intervalIdRef.current);
  }, [isRunning]);

  // Stopwatch controls
  const handleStart = () => {
    if (!activity.trim()) return;
    setElapsedTime(0);
    setStartTime(new Date());
    startTimeref.current = Date.now();
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    pauseTimeref.current = elapsedTime;
  };

  const handleResume = () => {
    setIsRunning(true);
    startTimeref.current = Date.now() - pauseTimeref.current;
  };

  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
    setStartTime(null);
    setActivity('');
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
    handleReset();
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
      {!session ? (
        <div>Login first</div>
      ) : (
        <div className="track-container">
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
              <button className="btn-start" onClick={handleStart}>
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
                  <button className="btn-stop" onClick={handlePause}>Pause</button>
                ) : (
                  <button className="btn-stop" onClick={handleResume}>Resume</button>
                )}
                <button className="btn-stop" onClick={handleReset}>Reset</button>
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
                    <strong>{log.task}</strong> {log.projectName && <>— <em>{log.projectName}</em></>}<br />
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
