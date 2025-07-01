import { borderColor } from "@mui/system";

export const LineChartData = {
    labels:[
        "Monday",
        "Tuesday",
        "Wednesday",
        "thursay",
        "Friday",
        "Saturday",
        "Sunday"
    ],
    datasets:[
        {
            label: "Steps",
            data: [300,500,4500,600,800,700,900],
            borderColor: "rgd(75, 192, 192)",
        },
    ]
}
// y axis is the data inside the dataset
// x axis is labels