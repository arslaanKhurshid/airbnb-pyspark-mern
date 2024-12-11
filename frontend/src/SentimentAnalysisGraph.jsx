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

function SentimentGraph() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/location-yearly-sentiment").then((response) => {
      const data = response.data;
      const years = [...new Set(data.map((item) => item.year))].sort();
      const locations = [...new Set(data.map((item) => item.host_location))];

      const sentimentData = {};
      locations.forEach((location) => {
        sentimentData[location] = years.map((year) => {
          const yearData = data.filter(
            (item) => item.host_location === location && item.year === year
          );
          return yearData.length > 0 ? yearData[0].avg_sentiment : 0;
        });
      });

      // Assign a unique color for each location
      const colorPalette = [
        '#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6', '#1F77B4', 
        '#FF9F00', '#FFB6C1', '#8E44AD', '#2ECC71'
      ];
      
      const datasets = locations.map((location, index) => ({
        label: location,
        data: sentimentData[location],
        borderColor: colorPalette[index % colorPalette.length], // Reuse colors if needed
        fill: false,
        tension: 0.2,
      }));

      setChartData({
        labels: years,
        datasets: datasets,
        options: {
          scales: {
            y: {
              min: -1,
              max: 1,
              ticks: {
                stepSize: 0.1, // 0.1 increments for sentiment
              },
            },
          },
        },
      });
    });
  }, []);

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <h1>Year vs Sentiment for Locations</h1>
      {chartData && <Line data={chartData} />}
    </div>
  );
}

export default SentimentGraph;
