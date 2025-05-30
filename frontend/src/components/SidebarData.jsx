import React from 'react'
import AddTaskIcon from '@mui/icons-material/AddTask';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
export const SidebarData = [
    {
        title: "New Activity",
        icon: <AddTaskIcon/>,
        link: "/Track"
    },
    {
        title: "My Activities",
        icon: <AssignmentIcon/>,
        link: "/MyActivities"
    },
    {
        title: "Reports",
        icon: <AssessmentIcon/>,
        link: "/Reports"
    },
    {
        title: "My Account",
        icon: <AccountCircleIcon/>,
        link: "/Account"
    },

]