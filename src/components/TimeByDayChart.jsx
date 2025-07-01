import React from 'react';
import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
);



const TimeByDayChart = ({ data }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Time Spent',
        data: values,
        backgroundColor: '#00E5FF',
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 32,
      },
    ],
  };


  const formatToHHMM = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const seconds = context.raw;
          const minutes = Math.floor((seconds % 3600) / 60);
          const s = Math.floor(seconds % 60);
          return `${context.dataset.label || ''}: ${minutes > 0 ? `${minutes} min ` : ''}${s} secs`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return formatToHHMM(value);
        },
        stepSize: 900, // 900 seconds = 15 minutes
      },
      title: {
        display: true,
        text: '(HH:MM)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};


  return <Bar data={chartData} options={options} />;
};

export default TimeByDayChart;
