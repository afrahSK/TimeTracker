import React from 'react'
import AddTaskIcon from '@mui/icons-material/AddTask';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TimerIcon from '@mui/icons-material/Timer';
import Projects from './Projects';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
export const SidebarData = [
    {
        title: "New Activity",
        icon: <AddTaskIcon/>,
        link: "/track"
    },
    {
        title: "My Activities",
        icon: <AssignmentIcon/>,
        link: "/Myactivities"
    },
    {
        title: "Reports",
        icon: <AssessmentIcon/>,
        link: "/Reports"
    },
    {
        title: "manage Projects",
        icon: <FolderCopyIcon/>,
        link: "/projects"
    },
    {
        title: "Pomodoro",
        icon: <TimerIcon/>,
        link: "/pomodoro"
    },
    {
        title: "My Account",
        icon: <AccountCircleIcon/>,
        link: "/account"
    },

]