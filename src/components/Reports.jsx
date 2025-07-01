import React, { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from 'react-calendar'
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import { supabase } from '../supabase-client';
import TimeByDayChart from './TimeByDayChart';
import TimeByProjectChart from './TimeByProjectChart';
const ProjectBreakdown = ({ data }) => {
  return (
    <div className="project-breakdown-table">
      <ul>
        <div className="bd-headings">
          <li>Project</li>
          <li>Duration</li>
          <li>Duration %</li>
        </div>
        {Object.entries(data).map(([project, hours]) => (
          <li key={project} className="breakdown-row">
            <span className="project-name">{project}</span>
            <span className="project-hours">{hours.toFixed(2)} hrs</span>
          </li>
        ))}
        <div className="bd-total">
          <li>Total</li>
          <li>00:16:40</li>
          <li></li>
        </div>
      </ul>
    </div>
  );
};

const Reports = () => {
  const [projectFilterOpen, setProjectFilterOpen] = useState(false);
  const [memberFilterOpen, setMemberFilterOpen] = useState(false);
  const [tab, setTab] = useState('summary');
  const [isCalendarFilterOpen, setCalendarFilterOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [value, setValue] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
    console.log(isShareModalOpen);
  }
  const toggleFilter = () => {
    setCalendarFilterOpen(!isCalendarFilterOpen);
  }
  const toggle = () => {
    setProjectFilterOpen(!projectFilterOpen);
    setMemberFilterOpen(false);
  }
  const toggleMembers = () => {
    setMemberFilterOpen(!memberFilterOpen);
    setProjectFilterOpen(false);
  }
  const handleFilter = () => {

  }
  useEffect(() => {
    handleFilter();
  }, []);


  // for the bar graph of time spent by day
  // fetching the activity data
  // this state has dates as key, and time spent as values
  const [dailyTimeData, setDailyTimeData] = useState({});

  useEffect(() => {
    const fetchTimeByDay = async () => {
      // fetching all the data in ascending order
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.log(error.message);
        return;
      }

      const now = new Date();//current date
      const days = [];//will store the last 7 days in the format - 30th june,2025
      const totalByDays = {};//object that maps each day to total hours

      // Build last 7 days (today and 6 days before)
      // /this look will create 7 days keys
      // Each key will look like - 30th june, 2025
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);//todays date
        date.setDate(now.getDate() - i);
        const key = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        days.push(key);
        totalByDays[key] = 0; // default to 0 to every day
      }

      // take out the duration of each activity fetched
      data.forEach((activity) => {
        const start = new Date(activity.start_time);
        const end = new Date(activity.end_time);
        const durationSeconds = (end - start) / 1000; // in seconds
        const key = start.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        if (totalByDays[key] !== undefined) {
          totalByDays[key] += durationSeconds;
        }
      });

      setDailyTimeData(totalByDays);
    };

    fetchTimeByDay();
  }, []);


  // fetch time by project 
  const [projectTimeData, setProjectTimeData] = useState({});
  useEffect(() => {
    const fetchTimeByProject = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('start_time, end_time, projects(name)');

      if (error) {
        console.log(error.message);
        return;
      }

      const projectDurations = {};

      data.forEach((activity) => {
        const start = new Date(activity.start_time);
        const end = new Date(activity.end_time);
        const durationHours = (end - start) / 3600000; // in hours

        const projectName = activity.projects?.name || 'Without Project';
        projectDurations[projectName] = (projectDurations[projectName] || 0) + durationHours;
      });

      setProjectTimeData(projectDurations);
    };

    fetchTimeByProject();
  }, []);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reports</h2>
        <div className="reports-tabs">
          <span className={tab === 'summary' ? 'active-tab' : ''} onClick={() => { setTab('summary') }}>Summary</span>
          <span className={tab === 'detailed' ? 'active-tab' : ''} onClick={() => { setTab('detailed') }}>Detailed</span>
        </div>
        <div className="reports-actions">
          <button className='btn'>Export as CSV</button>
          <button className='btn'>Export as PDF</button>
          <button className='share' onClick={toggleShareModal}><SendAndArchiveIcon />Save and Share</button>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filterCalendar">
          <span className="date-range" onClick={toggleFilter}><CalendarMonthIcon /> 16 Jun 2025 - 22 Jun 2025 · W25</span>
          {isCalendarFilterOpen && (
            <>
              <div className="filterCalendarModal">

                <div className="filterCalendarContent">
                  <div className="filter-left">
                    <ul>
                      <li onClick={() => {
                        setFilter('week')
                        setCalendarFilterOpen(false);
                      }}>Current week</li>
                      <li onClick={() => {
                        setFilter('7days')
                        setCalendarFilterOpen(false)
                      }}>Last 7 days</li>
                      <li onClick={() => {
                        setFilter('month')
                        setCalendarFilterOpen(false)
                      }}>Current month</li>
                      <li onClick={() => {
                        setFilter('3month');
                        setCalendarFilterOpen(false);
                      }}>Last 3 months</li>
                    </ul>
                  </div>
                  <div className="filter-right">
                    <Calendar onChange={(date) => {
                      setValue(date)
                      setFilter('calendar')
                      setCalendarFilterOpen(false);
                    }} value={value} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="projectFilter">
          <button className="add-filter" onClick={toggle}>Project{<KeyboardArrowDownIcon />}</button>
          {
            projectFilterOpen && (
              <>
                <div className="projectDropdownModal">
                  <div className="projectDropdownContent">
                    <ul>
                      <div className="project-det">
                        <li>All projects</li>
                        <input type="checkbox" name="all projects" id="all" />
                      </div>
                      <div className="project-det">
                        <li>Project 1</li>
                        <input type="checkbox" name="all projects" id="all" />
                      </div>
                      <div className="project-det">
                        <li>Project 1</li>
                        <input type="checkbox" name="all projects" id="all" />
                      </div>
                    </ul>
                  </div>
                </div>
              </>
            )
          }
        </div>
        <div className="memberFilter">
          <button className="add-filter" onClick={toggleMembers}>All Members{<KeyboardArrowDownIcon />}</button>
          {
            memberFilterOpen && (
              <>
                <div className=" projectDropdownModal">
                  <div className="memberFilterContent projectDropdownContent">
                    <ul>
                      <div className="project-det">
                        <li>All Members</li>
                        <input type="checkbox" name="all members" id="all" />
                      </div>
                      <div className="project-det">
                        <li>Member 1</li>
                        <input type="checkbox" name="all members" id="all" />
                      </div>
                      <div className="project-det">
                        <li>Member 2</li>
                        <input type="checkbox" name="all members" id="all" />
                      </div>
                    </ul>
                  </div>
                </div>
              </>
            )
          }
        </div>
      </div>

      <div className="summary-cards">
        <div className="card">
          <p className="label">Total Hours</p>
          <p className="value">0:00:49</p>
        </div>
        <div className="card">
          <p className="label">Average Daily Hours</p>
          <p className="value">0.01 Hours</p>
        </div>
      </div>
      <div className="reports-tab">
        {/* summary tab */}
        {
          tab === 'summary' ? (
            <>
              <span className='summary-tab'>
                <div className="summary-section">
                  <div className="summary-by-duration common">
                    Time spent by Day
                    {/* bar chart */}
                    {/* x-date, y-hours worked */}
                    {/* helps identify productivity patterns */}
                    <TimeByDayChart data={dailyTimeData} />
                  </div>
                  <div className="summary-by-project common">
                    Time spent by project
                    {/* total time spent across all projects */}
                    <TimeByProjectChart data={projectTimeData}/>
                  </div>
                </div>
                <div className="summary-breakdown common">
                  <p>Project and member breakdown</p>
                  {/* contribution per team member across projects*/}
                  {/* useful for team insights and billing  */}
                  <ProjectBreakdown data={projectTimeData}/>
                </div>
                <div className="heatmap common">
                  {/* heatmap view like github */}
                  heatmap summary of total hours worked on particular day /
                </div>
              </span>
            </>
          ) : (
            <>
              <span className='detailed-tab'>
                <div className="common det">
                  <div className="det-header">
                    All activity entries this week
                    
                    <button className="addEntry">
                      + Add Entry
                    </button>
                  </div>
                  <div className="repo">
                    fejfhh feuhfuhf
                  </div>
                </div>

              </span>
            </>
          )
        }
      </div>
      {isShareModalOpen && (
        <>
          <div className="modal-overlay">
            <div className="modal-content share-modal">
              <div className="modal-header">
                <p>Save</p>
                <button className="share-close" onClick={toggleShareModal}>✖</button>
              </div>
              <div className="share-form">
                <label htmlFor="Report name">Report Name</label>
                <input type="text" />
                <p className='share-p'>Share this report</p>
                <p className='share-access'>People with access</p>
                <div className="access-owner">you</div>
                <p>General Access</p>
                <div className="gen-access">
                  anyone with link
                </div>
                <button className="copy-link">Copy Link</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>


  );
};

export default Reports;
