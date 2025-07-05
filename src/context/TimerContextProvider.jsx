import React, { useState, useRef, useEffect } from "react";
import { TimerContext } from "./TimerContext";
import { supabase } from "../supabase-client";

const TimerContextProvider = ({ children }) => {
  const [activity, setActivity] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [session, setSession] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pauseTimeRef = useRef(0);

  //  Fetch session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  // Restore from localStorage on mount
  useEffect(() => {
    const storedStartTime = localStorage.getItem("startTime");
    const storedIsRunning = localStorage.getItem("isRunning") === "true";

    if (storedStartTime) {
      const parsedStartTime = new Date(storedStartTime);
      setStartTime(parsedStartTime);
      startTimeRef.current = parsedStartTime.getTime();
      const elapsed = Date.now() - parsedStartTime.getTime();
      setElapsedTime(elapsed);
    }

    if (storedIsRunning) {
      setIsRunning(true);
    }
  }, []);

  // Timer ticking
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Update DB + Broadcast
  const updateSessionInDB = async (data) => {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.id) return;

    const userId = user.data.user.id;

    // Save to DB
    await supabase.from('active_sessions').upsert({
      user_id: userId,
      activity: data.activity || '',
      project_id: data.project_id || null,
      start_time: data.start_time || null,
      is_running: data.is_running ?? false,
    });

    // Broadcast to other tabs/devices
    await supabase.channel('broadcast-session').send({
      type: 'broadcast',
      event: 'sync_timer',
      payload: {
        activity: data.activity,
        project_id: data.project_id,
        start_time: data.start_time,
        is_running: data.is_running,
      },
    });
  };

  // Listen for broadcast updates
  useEffect(() => {
    const channel = supabase
      .channel('broadcast-session')
      .on('broadcast', { event: 'sync_timer' }, (payload) => {
        const sessionData = payload.payload;
        console.log('📡 Broadcast received:', sessionData);

        setActivity(sessionData.activity || '');
        setSelectedProject(sessionData.project_id || null);
        setIsRunning(sessionData.is_running);

        const sessionStart = sessionData.start_time
          ? new Date(sessionData.start_time)
          : null;

        setStartTime(sessionStart);
        if (sessionData.is_running && sessionStart) {
          setElapsedTime(Date.now() - sessionStart.getTime());
          startTimeRef.current = sessionStart.getTime();
        }
      });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Start
  const startTimer = async () => {
    const now = Date.now();
    const iso = new Date(now).toISOString();
    setStartTime(new Date(now));
    startTimeRef.current = now;
    setIsRunning(true);
    localStorage.setItem("startTime", iso);
    localStorage.setItem("isRunning", "true");

    await updateSessionInDB({
      activity,
      project_id: selectedProject,
      start_time: iso,
      is_running: true,
    });
  };

  // Pause
  const pauseTimer = async () => {
    setIsRunning(false);
    pauseTimeRef.current = elapsedTime;
    localStorage.setItem("isRunning", "false");

    await updateSessionInDB({
      activity,
      project_id: selectedProject,
      start_time: startTime?.toISOString(),
      is_running: false,
    });
  };

  // Resume
  const resumeTimer = async () => {
    const now = Date.now();
    const newStartTime = now - pauseTimeRef.current;
    startTimeRef.current = newStartTime;
    const iso = new Date(newStartTime).toISOString();

    setStartTime(new Date(newStartTime));
    setIsRunning(true);
    localStorage.setItem("startTime", iso);
    localStorage.setItem("isRunning", "true");

    await updateSessionInDB({
      activity,
      project_id: selectedProject,
      start_time: iso,
      is_running: true,
    });
  };

  // Reset
  const resetTimer = async () => {
    setIsRunning(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedTime(0);
    pauseTimeRef.current = 0;
    localStorage.removeItem("startTime");
    localStorage.setItem("isRunning", "false");

    await updateSessionInDB({
      activity: '',
      project_id: null,
      start_time: null,
      is_running: false,
    });
  };

  return (
    <TimerContext.Provider
      value={{
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
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContextProvider;
