import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase-client.js';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';

const Myactivities = () => {
    const [groupedActivities, setGroupedActivities] = useState({});

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const toggle = () => {
        setIsFilterOpen(!isFilterOpen);
    }
    useEffect(() => {
        const fetchActivities = async () => {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .order('start_time', { ascending: false });

            if (error) {
                console.error('Error fetching activities:', error.message);
                return;
            }

            // Grouping by date-Month-Year
            const groups = {};

            data.forEach((activity) => {
                const date = new Date(activity.start_time);
                const monthYear = date.toLocaleString('default', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                });
                console.log(monthYear);
                if (!groups[monthYear]) {
                    groups[monthYear] = [];
                }

                groups[monthYear].push(activity);
            });

            setGroupedActivities(groups);
        };

        fetchActivities();
    }, []);
    const [value, setValue] = useState(new Date());

    //   filter logic
    const [filter, setFilter] = useState(''); //can be this week, 7 days, current month, last 3 months. calendar
    useEffect(() => {
        const fetchActivities = async () => {
            const { data, error } = await supabase.from('activities')
                .select('*')
                .order('start_time', { ascending: false });

            if (error) {
                console.log(error.message);
            }


            let filtered = data;
            const now = new Date();

            // This week
            if (filter === 'week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
                filtered = data.filter(item => new Date(item.start_time) >= startOfWeek);
            } else if (filter === '7days') {
                const last7 = new Date(now);
                last7.setDate(now.getDate() - 6);
                filtered = data.filter(item => new Date(item.start_time) >= last7);
            } else if (filter === 'month') {
                filtered = data.filter(item => {
                    const d = new Date(item.start_time);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
            } else if (filter === '3months') {
                const threeMonthsAgo = new Date(now);
                threeMonthsAgo.setMonth(now.getMonth() - 2);
                filtered = data.filter(item => new Date(item.start_time) >= threeMonthsAgo);
            } else if (filter === 'calendar') {
                const selectedDate = value.toDateString();
                filtered = data.filter(item => {
                    const actDate = new Date(item.start_time).toDateString();
                    return actDate === selectedDate;
                });
            } else {
                filtered = data;
            }
            const groups = {};
            filtered.forEach((activity) => {
                const date = new Date(activity.start_time);
                const monthYear = date.toLocaleString('default', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                });

                if (!groups[monthYear]) {
                    groups[monthYear] = [];
                }
                groups[monthYear].push(activity);
            });
            setGroupedActivities(groups);
        };
        fetchActivities();

    }, [filter, value])
 
    return (
        <div className="my-activities">
            <div className='header'>
                <h2>My Activities</h2>
                {filter !== '' && (
                    <p className='filter-p'>
                        {(() => {
                            switch (filter) {
                                case 'week': return 'Current Week';
                                case '7days': return 'Last 7 Days';
                                case 'month': return 'Current Month';
                                case '3months': return 'Last 3 Months';
                                default: return '';
                            }
                        })()}
                    </p>
                )}

                {filter !== '' && (
                    <button className='clrFilter' onClick={() => { setFilter(''); setIsFilterOpen(false); setValue(new Date()) }}>Clear Filter</button>)}
                <div className="filter">

                    <button className='filter-btn' onClick={toggle}>
                        <TuneIcon />Filter<KeyboardArrowDownIcon /></button>
                    {isFilterOpen && (
                        <>
                            <div className='filterModal'>
                                <div className="filter-content">
                                    <div className="filter-left">
                                        <ul>
                                            <li onClick={() => {
                                                setFilter('week')
                                                setIsFilterOpen(false);
                                            }}>Current week</li>
                                            <li onClick={() => {
                                                setFilter('7days')
                                                setIsFilterOpen(false)
                                            }}>Last 7 days</li>
                                            <li onClick={() => {
                                                setFilter('month')
                                                setIsFilterOpen(false)
                                            }}>Current month</li>
                                            <li onClick={() => {
                                                setFilter('3month');
                                                setIsFilterOpen(false);
                                            }}>Last 3 months</li>
                                        </ul>
                                    </div>
                                    <div className="filter-right">
                                        <Calendar onChange={(date) => {
                                            setValue(date)
                                            setFilter('calendar')
                                            setIsFilterOpen(false);
                                        }} value={value} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
            <div className="activities-scroll">
                {Object.keys(groupedActivities).length === 0 ? (
                    <p className="no-activities">No activities found.</p>
                ) : (
                    Object.entries(groupedActivities).map(([month, activities]) => {
                        const total = activities.reduce((acc, act) => {
                            const start = new Date(act.start_time);
                            const end = new Date(act.end_time);
                            return acc + (end - start);
                        }, 0);
                        const total_hours = Math.floor(total / (1000 * 60 * 60));
                        const total_minutes = Math.floor(total / (1000 * 60) % 60);
                        const total_seconds = Math.floor(total / (1000) % 60);
                        const formatted_total = `${total_hours.toString()} hour
                  ${total_minutes.toString()} minutes ${total_seconds.toString().padStart(2, '0')} seconds` 
                        return(
                            <div key={month} className="month-group">
                                <h3>{month} <p className='worked'>Total hours worked: {formatted_total}</p></h3>
                                <ul>
                                    {activities.map((act) => {
                                        const start = new Date(act.start_time);
                                        const end = new Date(act.end_time);
                                        const durationMs = end - start;
                                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                                        const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
                                        const seconds = Math.floor((durationMs / 1000) % 60);
                                        const formattedDuration = `${hours.toString()} hour
                  ${minutes.toString()} minutes ${seconds.toString().padStart(2, '0')} seconds`
                                        return (
                                            <li key={act.id}>
                                                <strong>{act.activity}</strong><br />
                                                {start.toLocaleTimeString()} - {end.toLocaleTimeString()} &nbsp;&nbsp;
                                                <span style={{ color: '#888' }}>{formattedDuration}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    }
                    )
                )}
            </div>
        </div>
    );
};

export default Myactivities;
