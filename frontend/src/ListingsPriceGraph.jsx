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

function ListingsPriceGraph() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/location-yearly-listings-price").then((response) => {
      const data = response.data;
      const years = [...new Set(data.map((item) => item.year))].sort();
      const locations = [...new Set(data.map((item) => item.host_location))];

      const listingsData = {};
      const priceData = {};
      locations.forEach((location) => {
        listingsData[location] = years.map((year) => {
          const yearData = data.filter(
            (item) => item.host_location === location && item.year === year
          );
          return yearData.length > 0 ? yearData[0].num_listings : 0;
        });
        priceData[location] = years.map((year) => {
          const yearData = data.filter(
            (item) => item.host_location === location && item.year === year
          );
          return yearData.length > 0 ? yearData[0].avg_price : 0;
        });
      });

      const datasets = [
        ...locations.map((location, index) => ({
          label: `${location} Listings`,
          data: listingsData[location],
          borderColor: `hsl(${(index * 360) / locations.length}, 70%, 60%)`,
          fill: false,
          tension: 0.2,
        })),
        ...locations.map((location, index) => ({
          label: `${location} Avg Price`,
          data: priceData[location],
          borderColor: `hsl(${(index * 360) / locations.length}, 70%, 80%)`,
          fill: false,
          tension: 0.2,
          borderDash: [5, 5],
        })),
      ];

      setChartData({
        labels: years,
        datasets: datasets,
      });
    });
  }, []);

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <h1>Year vs Number of Listings and Average Price</h1>
      {chartData && <Line data={chartData} />}
    </div>
  );
}

export default ListingsPriceGraph;
