import React, { useContext } from 'react'
import { SidebarData } from './SidebarData'
import { useNavigate } from 'react-router-dom'
import { TimerContext } from '../context/TimerContext'
const Sidebar = () => {
  const navigate = useNavigate();
  const { isRunning, elapsedTime } = useContext(TimerContext);
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  return (
    <div className='sidebar'>
      <ul className='sidebarList'>
        {
          SidebarData.map((val, key) => {
            return (
              <li className='sidebarRow' key={key} onClick={() => navigate(val.link)}
                id={window.location.pathname === val.link ? "active" : ""}>
                {" "}
                <div id='icon'>{val.icon}</div>{" "}
                <div id='title'>{val.title}
                  {val.link === "/track" && isRunning && (
                  <span style={{ marginLeft: '8px', color: 'white', fontSize: '0.85rem' }}>
                    {formatTime(elapsedTime)}
                  </span>
                )}
                </div>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default Sidebar