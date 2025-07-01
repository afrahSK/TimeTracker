import {Pie} from "react-chartjs-2"
import {Chart as ChartJS,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js"
ChartJS.register(
    Tooltip,
    Legend,
    ArcElement
)
export const PieChart = () => {
    const PieChartData = {
        labels:[
            "facebook", "Instagram", "Twitter", " Youtube", "Linkedin"
        ],
        datasets:[
           { 
                label: "Time spent",
                data: [120, 60, 30, 90, 45],
                background,color: [
                    "rgba(183, 55, 82, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(153, 102, 255, 0.2)"
                ],
                hoverOffset: 4,
           }

        ]
    }
    const options ={

    }
    return(
        <>
            <Pie options={options} data={PieChartData}/>
        </>
    )
}