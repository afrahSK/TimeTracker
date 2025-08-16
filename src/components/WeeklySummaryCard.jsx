import React from 'react';

const WeeklySummaryCard = ({ weekRange, totalTime, tasksCompleted, mostActiveDay, topProject }) => {
  return (
    <div className="summary-card" style={{
      padding: '20px',
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      width: '100%',
      height: '100%',
    }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>This Week at a Glance</h3>
      <p><strong>Week:</strong> {weekRange}</p>
      <p><strong>Total Time:</strong> {totalTime}</p>
      <p><strong>Tasks Completed:</strong> {tasksCompleted}</p>
      <p><strong>Most Active Day:</strong> {mostActiveDay}</p>
      <p><strong>Top Project:</strong> {topProject}</p>
    </div>
  );
};

export default WeeklySummaryCard;
