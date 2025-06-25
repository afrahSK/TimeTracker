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
  Legend
);

// Helper: Convert decimal hours to HH:MM
const formatHoursToHHMM = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

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
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `Time: ${formatHoursToHHMM(value)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatHoursToHHMM(value),
          color: '#AAB2C4',
          stepSize: 0.25 // ~15 mins
        },
        title: {
          display: true,
          text: '(HH:MM)',
          color: '#AAB2C4',
          padding: { top: 10 }
        },
        grid: {
          color: '#EDEDED',
          drawBorder: false
        }
      },
      x: {
        ticks: { color: '#AAB2C4' },
        grid: {
          display: false
        }
      }
    }
  };
  console.log(data);
  return <Bar data={chartData} options={options} />;
};

export default TimeByDayChart;
