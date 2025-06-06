import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase-client.js';

const MyActivities = () => {
  const [groupedActivities, setGroupedActivities] = useState({});

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

      // Grouping by Month-Year
      const groups = {};

      data.forEach((activity) => {
        const date = new Date(activity.start_time);
        const monthYear = date.toLocaleString('default', {
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
  }, []);

  return (
    <div className="my-activities">
      <h2>My Activities</h2>
      <div className="activities-scroll">
        {Object.keys(groupedActivities).length === 0 ? (
          <p className="no-activities">No activities found.</p>
        ) : (
          Object.entries(groupedActivities).map(([month, activities]) => (
            <div key={month} className="month-group">
              <h3>{month}</h3>
              <ul>
                {activities.map((act) => (
                  <li key={act.id}>
                    <strong>{act.activity}</strong><br />
                    {new Date(act.start_time).toLocaleString()} → {new Date(act.end_time).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyActivities;
