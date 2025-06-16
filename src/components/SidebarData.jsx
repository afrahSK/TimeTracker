import React from 'react'
import AddTaskIcon from '@mui/icons-material/AddTask';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TimerIcon from '@mui/icons-material/Timer';
export const SidebarData = [
    {
        title: "New Activity",
        icon: <AddTaskIcon/>,
        link: "/Track"
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