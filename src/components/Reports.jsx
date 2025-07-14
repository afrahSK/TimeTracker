import React, { useState, useEffect, useRef } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from 'react-calendar'
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import { supabase } from '../supabase-client';
import TimeByDayChart from './TimeByDayChart';
import TimeByProjectChart from './TimeByProjectChart';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../heatmap.css'
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
  const [filter, setFilter] = useState('week');
  const [value, setValue] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [avgDailyHours, setAvgDailyHours] = useState(0);
  const [activityEntries, setActivityEntries] = useState([]);
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

  // handle the filter accross the reports page
  const handleFilter = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('id, activity, start_time, end_time, project_id, projects(name)')
      .order('start_time', { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    const now = new Date();
    let filteredData = [];

    if (filter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

      filteredData = data.filter((item) => {
        const start = new Date(item.start_time);
        return start >= startOfWeek && start <= endOfWeek;
      });

    } else if (filter === '7days') {
      const last7 = new Date(now);
      last7.setDate(now.getDate() - 6);

      filteredData = data.filter((item) => {
        const start = new Date(item.start_time);
        return start >= last7 && start <= now;
      });

    } else if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      filteredData = data.filter((item) => {
        const start = new Date(item.start_time);
        return start >= startOfMonth && start <= endOfMonth;
      });

    } else if (filter === '3month') {
      const past3Months = new Date(now);
      past3Months.setMonth(now.getMonth() - 3);

      filteredData = data.filter((item) => {
        const start = new Date(item.start_time);
        return start >= past3Months && start <= now;
      });

    } else if (filter === 'calendar' && value) {
      const selected = new Date(value);
      filteredData = data.filter((item) => {
        const start = new Date(item.start_time);
        return start.toDateString() === selected.toDateString();
      });

    } else {
      // Default: this week
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      filteredData = data.filter((item) => {
        const start = new Date(item.start_time);
        return start >= startOfWeek && start <= endOfWeek;
      });
    }

    const formatted = filteredData.map((entry) => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const durationMs = end - start;

      const hours = String(Math.floor(durationMs / 3600000)).padStart(2, '0');
      const minutes = String(Math.floor((durationMs % 3600000) / 60000)).padStart(2, '0');
      const seconds = String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0');

      return {
        id: entry.id,
        date: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        activity: entry.activity || 'Untitled',
        project: entry.projects?.name || 'No Project',
        duration: `${hours}:${minutes}:${seconds}`,
      };
    });

    setActivityEntries(formatted);
  };
  useEffect(() => {
    handleFilter();
  }, [filter, value]);



  useEffect(() => {
    handleFilter();
  }, []);

  // for the bar graph of time spent by day
  // fetching the activity data
  // this state has dates as key, and time spent as values
  const [dailyTimeData, setDailyTimeData] = useState({});

  useEffect(() => {
    const fetchTimeByDay = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.log(error.message);
        return;
      }

      const now = new Date();
      let days = [];
      const totalByDays = {};

      let startDate = new Date(now);
      let endDate = new Date(now);

      if (filter === 'week') {
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      } else if (filter === '7days') {
        startDate.setDate(now.getDate() - 6);
      } else if (filter === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (filter === '3month') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (filter === 'calendar' && value) {
        startDate = new Date(value);
        endDate = new Date(value);
      }

      // build all days between startDate and endDate
      let current = new Date(startDate);
      while (current <= endDate) {
        const key = current.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        days.push(key);
        totalByDays[key] = 0;
        current.setDate(current.getDate() + 1);
      }

      data.forEach((activity) => {
        const start = new Date(activity.start_time);
        const end = new Date(activity.end_time);

        if (start < startDate || start > endDate) return;

        const key = start.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        const durationSeconds = (end - start) / 1000;

        if (totalByDays[key] !== undefined) {
          totalByDays[key] += durationSeconds;
        }
      });

      setDailyTimeData(totalByDays);
      const totalSeconds = Object.values(totalByDays).reduce((a, b) => a + b, 0);
      setTotalHours(totalSeconds / 3600);
      setAvgDailyHours(totalSeconds / 3600 / days.length);
    };

    fetchTimeByDay();
  }, [filter, value]);



  // heatmap data
  const [heatmapData, setHeatmapData] = useState([]);
  useEffect(() => {
    const fetchHeatmapData = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('start_time, end_time')
        .order('start_time', { ascending: true });

      if (error) {
        console.error(error.message);
        return;
      }

      const now = new Date();
      const totalByDate = {};

      // Initialize all past 360 days
      for (let i = 0; i < 360; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const key = date.toISOString().split('T')[0]; // yyyy-mm-dd
        totalByDate[key] = 0;
      }

      data.forEach((activity) => {
        const start = new Date(activity.start_time);
        const end = new Date(activity.end_time);
        const duration = (end - start) / 1000; // in seconds

        const key = start.toISOString().split('T')[0]; // yyyy-mm-dd
        if (totalByDate[key] !== undefined) {
          totalByDate[key] += duration;
        }
      });

      const converted = Object.entries(totalByDate).map(([date, seconds]) => ({
        date,
        count: Math.round(seconds / 60), // minutes, rounded
      }));
      console.log(converted)
      setHeatmapData(converted);
    };

    fetchHeatmapData();
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

  const getFilterLabel = () => {
    switch (filter) {
      case 'week': return 'This Week';
      case '7days': return 'Last 7 Days';
      case 'month': return 'This Month';
      case '3month': return 'Last 3 Months';
      case 'calendar': return value ? `On ${new Date(value).toLocaleDateString('en-GB')}` : 'Selected Day';
      default: return 'This Week';
    }
  };


  const getDateRangeLabel = () => {
    const now = new Date();

    if (filter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startLabel = startOfWeek.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const endLabel = endOfWeek.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

      const weekNumber = Math.ceil(((startOfWeek - new Date(startOfWeek.getFullYear(), 0, 1)) / 86400000 + startOfWeek.getDay() + 1) / 7);

      return `${startLabel} - ${endLabel} · W${weekNumber}`;
    }

    if (filter === '7days') {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);

      const startLabel = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const endLabel = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

      return `${startLabel} - ${endLabel}`;
    }

    if (filter === 'month') {
      return now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }

    if (filter === '3month') {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);

      const startLabel = start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      const endLabel = now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

      return `${startLabel} - ${endLabel}`;
    }

    if (filter === 'calendar' && value) {
      return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return '';
  };

  // logic to donwload csv
  const downloadCSV = () => {
  const headers = ['Date', 'Time', 'Activity', 'Project', 'Duration'];
  const rows = activityEntries.map(entry => [entry.date, entry.time, entry.activity, entry.project, entry.duration]);

  const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Report_${getDateRangeLabel().replace(/\s/g, '_')}.csv`);
  link.click();
};


// export as pdf
const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Detailed Activity Report', 14, 20);

  doc.setFontSize(10);
  doc.text(`Date Range: ${getDateRangeLabel()}`, 14, 28);

  autoTable(doc, {
    startY: 32,
    head: [['Date', 'Time', 'Activity', 'Project', 'Duration']],
    body: activityEntries.map(entry => [
      entry.date,
      entry.time,
      entry.activity,
      entry.project,
      entry.duration,
    ]),
    styles: { fontSize: 9 },
  });

  doc.save(`Report_${getDateRangeLabel().replace(/\s/g, '_')}.pdf`);
};


// to close modals when clicking elsewhere

  return (
    <div className="reports-container">
      <div className="reports-inner">
        <div className="reports-header">
          <h2>Reports</h2>
          <div className="reports-tabs">
            <span className={tab === 'summary' ? 'active-tab' : ''} onClick={() => { setTab('summary') }}>Summary</span>
            <span className={tab === 'detailed' ? 'active-tab' : ''} onClick={() => { setTab('detailed') }}>Detailed</span>
          </div>
          <div className="reports-actions">
            <button className='btn'  onClick={downloadCSV}>Export as CSV</button>
            <button className='btn' onClick={downloadPDF}>Export as PDF</button>
            <button className='share' onClick={toggleShareModal}><SendAndArchiveIcon />Save and Share</button>
          </div>
        </div>

        <div className="reports-filters">
          <div className="filterCalendar">
            <span className="date-range" onClick={toggleFilter}><CalendarMonthIcon /> {getDateRangeLabel()}</span>
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
          <div className="filter-btn-report">
            {
              (filter !== 'week') && (
                <button
                  className="clear-filter-btn"
                  onClick={() => {
                    setFilter('week');
                    setValue('');
                    setCalendarFilterOpen(false);
                  }}
                >
                  Clear Filter
                </button>
              )
            }
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
          <div className="card one">
            <p className="label">Total Hours</p>
            <p className="value">{totalHours.toFixed(2)} hrs</p>
          </div>
          <div className="card two">
            <p className="label">Average Daily Hours</p>
            <p className="value">{avgDailyHours.toFixed(2)} hrs</p>
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
                      Time spent by Day <span className="filter-label">({getFilterLabel()})</span>
                      <TimeByDayChart data={dailyTimeData} />
                    </div>
                    <div className="summary-by-project common">
                      Time spent by project
                      {/* total time spent across all projects */}
                      <TimeByProjectChart data={projectTimeData} />
                    </div>
                  </div>
                  <div className="summary-breakdown common">
                    <p>Project breakdown</p>
                    {/* contribution per team member across projects*/}
                    {/* useful for team insights and billing  */}
                    <ProjectBreakdown data={projectTimeData} />
                  </div>
                  <div className="heatmap common">
                    {/* heatmap view like github */}
                    heatmap summary of total hours worked on particular day

                    <CalendarHeatmap
                      startDate={new Date(new Date().setDate(new Date().getDate() - 360))} // last 1 year
                      endDate={new Date()}
                      values={heatmapData}
                      classForValue={(value) => {
                        if (!value || value.count === 0) return 'color-empty';
                        if (value.count <= 10) return 'color-scale-1';   // 0–10 min
                        if (value.count <= 30) return 'color-scale-2';   // 11–30 min
                        if (value.count <= 60) return 'color-scale-3';   // 31–60 min
                        return 'color-scale-4';                          // > 60 min
                      }}

                      tooltipDataAttrs={(value) => {
                        if (!value || !value.date || value.count === 0) return {};
                        return {
                          'data-tooltip-id': 'heatmap-tooltip',
                          'data-tooltip-content': `${value.count} min${value.count > 1 ? 's' : ''} on ${value.date}`
                        };
                      }}

                    />
                    <ReactTooltip id="heatmap-tooltip" />
                  </div>
                </span>
              </>
            ) : (
              <>
                <span className='detailed-tab'>
                  <div className="detailed-tab common det">
                    <div className="det-header">
                      All activity entries this week
                      <button className="addEntry">+ Add Entry</button>
                    </div>
                    <div className="repo">
                      <table className="activity-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Activity</th>
                            <th>Project</th>
                            <th>Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityEntries.map((entry) => (
                            <tr key={entry.id}>
                              <td>{entry.date}</td>
                              <td>{entry.time}</td>
                              <td>{entry.activity}</td>
                              <td>{entry.project}</td>
                              <td>{entry.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
    </div>


  );
};

export default Reports;
