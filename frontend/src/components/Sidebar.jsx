import React from 'react'
import {SidebarData} from './SidebarData'
import { useNavigate} from 'react-router-dom'
const Sidebar = () => {
    const navigate = useNavigate();
  return (
    <div className='sidebar'>
       <ul className='sidebarList'>
        {
        SidebarData.map((val,key)=>{
            return(
                <li className='sidebarRow' key={key} onClick={()=>navigate(val.link)}
                id={window.location.pathname === val.link ? "active" : ""}>
                    {" "}
                    <div id='icon'>{val.icon}</div>{" "}
                    <div id='title'>{val.title}</div>
                </li>
            )
        })
       }
       </ul>
    </div>
  )
}

export default Sidebar