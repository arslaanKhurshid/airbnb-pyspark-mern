import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [locations, setLocations] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [averagePrice, setAveragePrice] = useState(null);

  useEffect(() => {
    // Fetch the distinct locations and room types from the backend
    const fetchData = async () => {
      try {
        const locationsRes = await fetch("http://localhost:5000/api/locations");
        if (!locationsRes.ok) {
          throw new Error("Failed to fetch locations");
        }
        const locationsData = await locationsRes.json();
        setLocations(locationsData);

        const roomTypesRes = await fetch("http://localhost:5000/api/room-types");
        if (!roomTypesRes.ok) {
          throw new Error("Failed to fetch room types");
        }
        const roomTypesData = await roomTypesRes.json();
        setRoomTypes(roomTypesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch the average price based on selected location and room type
  const handlePriceCalculation = async () => {
    if (!selectedLocation || !selectedRoomType) {
      alert("Please select both location and room type.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/average-price?location=${selectedLocation}&room_type=${selectedRoomType}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch average price");
      }
      const data = await response.json();
      if (data.average_price !== undefined) {
        setAveragePrice(data.average_price);
      } else {
        setAveragePrice("No data found.");
      }
    } catch (error) {
      console.error("Error fetching average price:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Home</h1>
      <p>Choose a graph to visualize:</p>
      <Link to="/reviews-graph">
        <button style={{ padding: "10px", margin: "20px" }}>
          Reviews Graph
        </button>
      </Link>
      <Link to="/listings-price-graph">
        <button style={{ padding: "10px", margin: "20px" }}>
          Listings & Price Graph
        </button>
      </Link>
      <Link to="/reviews-graph">
        <button style={{ padding: "10px", margin: "20px" }}>
          Sentiment Analysis
        </button>
      </Link>
      <Link to="/room-type-graph">
        <button style={{ padding: "10px", margin: "20px" }}>
          Year vs RoomType
        </button>
      </Link>

      <h2>Price Calculator</h2>
      <div>
        <label>Location: </label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">Select a location</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Room Type: </label>
        <select
          value={selectedRoomType}
          onChange={(e) => setSelectedRoomType(e.target.value)}
        >
          <option value="">Select room type</option>
          {roomTypes.map((roomType) => (
            <option key={roomType} value={roomType}>
              {roomType}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button onClick={handlePriceCalculation} style={{ padding: "10px", margin: "20px" }}>Get Average Price</button>
      </div>

      {averagePrice !== null && (
        <div>
          <h3>Average Price: {averagePrice}</h3>
        </div>
      )}
    </div>
  );
}

export default Home;
