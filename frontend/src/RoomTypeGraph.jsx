import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RoomTypeGraph() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/year-room-type").then((response) => {
      const data = response.data;
      const years = [...new Set(data.map((item) => item.year))].sort();
      const roomTypes = [...new Set(data.map((item) => item.room_type))];

      const roomTypeData = {};
      roomTypes.forEach((roomType) => {
        roomTypeData[roomType] = years.map((year) => {
          const yearData = data.filter(
            (item) => item.room_type === roomType && item.year === year
          );
          return yearData.length > 0 ? yearData[0].num_listings : 0;
        });
      });

      const datasets = roomTypes.map((roomType, index) => ({
        label: roomType,
        data: roomTypeData[roomType],
        borderColor: `hsl(${(index * 360) / roomTypes.length}, 70%, 60%)`,
        fill: false,
        tension: 0.2,
      }));

      setChartData({
        labels: years,
        datasets: datasets,
      });
    });
  }, []);

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <h1>Year vs Room Type</h1>
      {chartData && <Line data={chartData} />}
    </div>
  );
}

export default RoomTypeGraph;
