import React, { act, useState } from 'react'

const TrackDummy = () => {
    const [activity, setActivity] = useState("");
    const [startTime, setStartTime] = useState("");
    const [logs, setLogs] = useState([]);
    const handleStart = () => {
        if (!activity.trim()) return;
        setStartTime(new Date());
    }
    const handleStop = () => {
        if (!startTime) return;
        const endTime = new Date();
        const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
        const newLog = {
            task: activity,
            start: startTime.toLocaleTimeString(),
            end: endTime.toLocaleTimeString(),
            duration
        }
        setLogs([newLog, ...logs]);
        setStartTime(null);
        setActivity("");
    }
    const handleTime = () => {
        
    }
    return (
        <div className='track-container'>
            <div className="title">Start an Acitivity</div>
            <div className="track-inputs">
                <input type="text" className='inp-task' placeholder='What are you working on'
                    value={activity} onChange={(e) => { setActivity(e.target.value) }} />
                {!startTime ? (
                    <button className='btn-start'
                        onClick={handleStart}>Start</button>
                ) : (<></>)}
            </div>
            {startTime ? (
                <>
                    <div className="stopwatch">
                        <div className="display">

                        </div>
                        <div className="controls">
                            <button className="btn-stop" onClick={handleStop}>Stop</button>
                            <button className="btn-stop">Pause</button>
                            <button className="btn-stop">Reset</button>
                        </div>
                    </div>
                </>
            ) : <></>}

            <div className="track-logs">
                <h3>Activity logs</h3>
                {logs.length === 0 ? (

                    <p>No activities tracked yet</p>
                ) : (
                    <ul>
                        {logs.map((val, key) => {
                            return (
                                <li><strong>{val.task}</strong><br/>
                                    {" "}
                                    {val.start}{"->"}{val.end}<br/>{"Total Duration: "}
                                    {val.duration}
                                </li>
                            )
                        })}
                    </ul>
                )}

            </div>
        </div>
    )
}

export default TrackDummy