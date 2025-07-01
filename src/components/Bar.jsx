import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
export const BarChart = () => {
    const barChartData = {
        labels: [
            "Rent", "groceries", "utilities", "Entertainment", "Transportaion"
        ],
        datasets: [
            {
                label: "Expenses",
                data: [1200, 90, 150, 200, 100],
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgbla(54, 162, 235, 1",
                borderWidth:1,
            }
        ]
    }
    const options = {}
    const data = {}
    return <>
        <Bar options={options} data={barChartData} />
    </>
}