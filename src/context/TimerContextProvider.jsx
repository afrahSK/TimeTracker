import React, { useState, useRef, useEffect } from "react";
import { TimerContext } from "./TimerContext";

const TimerContextProvider = ({ children }) => {
  const [activity, setActivity] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const [startTime, setStartTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pauseTimeRef = useRef(0);

  // ✅ On first load: restore from localStorage
  useEffect(() => {
    const storedStartTime = localStorage.getItem("startTime");
    const storedIsRunning = localStorage.getItem("isRunning") === "true";

    if (storedStartTime) {
      const parsedStartTime = new Date(storedStartTime);
      setStartTime(parsedStartTime);
      startTimeRef.current = parsedStartTime.getTime(); // milliseconds
      const elapsed = Date.now() - parsedStartTime.getTime();
      setElapsedTime(elapsed);
    }

    if (storedIsRunning) {
      setIsRunning(true);
    }
  }, []);

  // ✅ Timer logic
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

  // ✅ Start
  const startTimer = () => {
    const now = Date.now();
    setStartTime(new Date(now));
    startTimeRef.current = now;
    setIsRunning(true);
    localStorage.setItem("startTime", new Date(now).toISOString());
    localStorage.setItem("isRunning", "true");
  };

  // ✅ Pause
  const pauseTimer = () => {
    setIsRunning(false);
    pauseTimeRef.current = elapsedTime;
    localStorage.setItem("isRunning", "false");
  };

  // ✅ Resume
  const resumeTimer = () => {
    const now = Date.now();
    const newStartTime = now - pauseTimeRef.current;
    startTimeRef.current = newStartTime;
    setStartTime(new Date(newStartTime));
    setIsRunning(true);
    localStorage.setItem("startTime", new Date(newStartTime).toISOString());
    localStorage.setItem("isRunning", "true");
  };

  // ✅ Reset
  const resetTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedTime(0);
    pauseTimeRef.current = 0;
    localStorage.removeItem("startTime");
    localStorage.setItem("isRunning", "false");
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
