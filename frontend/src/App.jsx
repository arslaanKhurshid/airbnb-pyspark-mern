import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import Home from "./Home.jsx";
import ReviewsGraph from "./ReviewsGraph.jsx";
import ListingsPriceGraph from "./ListingsPriceGraph.jsx";
import SentimentAnalysisGraph from "./SentimentAnalysisGraph.jsx";
import RoomTypeGraph from "./RoomTypeGraph.jsx"; // Import the new component

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reviews-graph" element={<ReviewsGraph />} />
        <Route path="/listings-price-graph" element={<ListingsPriceGraph />} />
        <Route path="/sentiment-analysis-graph" element={<SentimentAnalysisGraph />} />
        <Route path="/room-type-graph" element={<RoomTypeGraph />} />
      </Routes>
    </Router>
  );
}

export default App;
