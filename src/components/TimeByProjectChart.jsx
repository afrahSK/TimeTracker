// components/TimeByProjectChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TimeByProjectChart = ({ data }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: [
        '#4dc9f6', '#f67019', '#f53794',
        '#537bc4', '#acc236', '#166a8f',
        '#00a950', '#58595b', '#8549ba'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <Pie data={chartData} />
    </div>
  );
};

export default TimeByProjectChart;
