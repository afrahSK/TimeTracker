import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase-client.js'
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import WeeklySummaryCard from '../components/WeeklySummaryCard';

const Account = () => {
  const [session, setSession] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [edit, setEdit] = useState(false);
  const [hoursWorked, setHoursWorked] = useState('00');

  const getSession = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    setSession(user);
    // console.log(user.user_metadata.name);
    // console.log(user.email)
    setName(user.user_metadata.name);
    setEmail(user.email)
    const date = new Date(user.email_confirmed_at);
    const joined = date.toLocaleDateString();
    // console.log(joined)
    setDate(joined);
  }
  const calculateTotalHours = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    const { data: activities, error } = await supabase
      .from('activities')
      .select('start_time, end_time')
      .eq('user_id', user.id); // if user_id exists in your table

    if (error) {
      console.error('Error fetching activities:', error);
      return;
    }

    let totalSeconds = 0;
    activities.forEach((act) => {
      if (act.start_time && act.end_time) {
        const start = new Date(act.start_time);
        const end = new Date(act.end_time);
        totalSeconds += (end - start) / 1000;
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const formatted = `${hours}h ${minutes}m`;

    setHoursWorked(formatted);
  };

  useEffect(() => {
    getSession();
    calculateTotalHours();
  }, [])

  // add updated data
  const updateData = async (name) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { name: name }
    })
    if (error) {
      console.log(error)
    } else {
      console.log("data updated sucessfuly");
      alert("profile updated");
    }
  }
  const editProfile = () => {
    setEdit(true);
  }
  const saveProfile = async () => {
    await updateData(name);
    setEdit(false);
  }

  const [metrics, setMetrics] = useState({
    projects: 0,
    completed: 0,
    ongoing: 0,
    hours: 0,
    weekRange: '',
    mostActiveDay: '',
    topProject: '',
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const user = (await supabase.auth.getUser()).data.user;

      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      const { data: activities, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id);

      let totalSeconds = 0;
      let completed = 0;
      let ongoing = 0;

      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);

      const weekActivities = activities.filter(act =>
        act.start_time && new Date(act.start_time) >= sevenDaysAgo
      );

      const dayMap = {};
      const projectMap = {};

      weekActivities.forEach((act) => {
        if (act.start_time && act.end_time) {
          const start = new Date(act.start_time);
          const end = new Date(act.end_time);
          const duration = (end - start) / 1000;

          totalSeconds += duration;
          completed++;

          // Group by day
          const day = start.toLocaleDateString('en-US', { weekday: 'long' });
          dayMap[day] = (dayMap[day] || 0) + duration;

          // Group by project
          if (act.project_id) {
            projectMap[act.project_id] = (projectMap[act.project_id] || 0) + duration;
          }
        } else {
          ongoing++;
        }
      });

      // Determine most active day
      const [mostActiveDay] = Object.entries(dayMap).sort((a, b) => b[1] - a[1]);

      // Determine top project
      const [topProjectId] = Object.entries(projectMap).sort((a, b) => b[1] - a[1]);
      const topProject = projects.find(p => p.id === topProjectId?.[0])?.name;

      const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');

      const range = `${sevenDaysAgo.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      })} – ${now.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      })}`;

      setMetrics({
        projects: projects.length,
        completed,
        ongoing,
        hours: hrs,
        weekRange: range,
        mostActiveDay: mostActiveDay || 'N/A',
        topProject: topProject || 'N/A',
      });
    };


    fetchMetrics();
  }, []);



  return (
    <div className='about-container'>
      <div className="about-left about-divs">
        <div className="profile">
          <div className="profile-pic">
          </div>
          <div className="pic-details">
            <p className='profile-name'>{name}</p>
            <div className='editbtns'>
              <button className="edit-profile" onClick={() => editProfile()}>
                Edit Profile
              </button>
              {
                edit && (
                  <button className='edit-profile' onClick={() => saveProfile()}>Save</button>
                )
              }
            </div>
          </div>
        </div>
        <div className="details">
          <label htmlFor="name">Full Name</label>
          {
            edit ? (
              <>
                <input type="text" name='name' value={name} onChange={(e) => setName(e.target.value)} />
              </>
            ) : (
              <>
                <input type="text" name='name' value={name} disabled />
              </>
            )
          }
          <label htmlFor="email" id='maillabel'>Email</label>
          <input type="email" name='email' value={email} disabled />
          <p className='date-joined'>Date Joined: {date} </p>
        </div>
      </div>
      <div className="about-right">
        <div className="progress about-divs">
          <div className="progress about-divs">
            <WeeklySummaryCard
              weekRange={metrics.weekRange}
              totalTime={hoursWorked}
              tasksCompleted={metrics.completed}
              mostActiveDay={metrics.mostActiveDay}
              topProject={metrics.topProject}
            />
          </div>
        </div>
        <div className="matrics about-divs">
          <div className='matrics-grid first'>
            <div className="mat-left">
              <FolderCopyIcon className='folder-icon' fontSize='large' />
            </div>
            <div className="mat-right">
              <p>Projects</p>
              <p>{metrics.projects}</p>
            </div>
          </div>
          <div className='matrics-grid second'>
            <div className="mat-left">
              <FolderCopyIcon className='folder-icon' fontSize='large' />
            </div>
            <div className="mat-right">
              <p>Total hours tracked</p>
              <p>{hoursWorked}</p>
            </div>
          </div>
          <div className='matrics-grid third'>
            <div className="mat-left">
              <FolderCopyIcon className='folder-icon' fontSize='large' />
            </div>
            <div className="mat-right">
              <p>tasks completed</p>
              <p>03</p>
            </div>
          </div>
          <div className='matrics-grid fourth'>
            <div className="mat-left">
              <FolderCopyIcon className='folder-icon' fontSize='large' />
            </div>
            <div className="mat-right">
              <p>Hours worked</p>
              <p>03</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account