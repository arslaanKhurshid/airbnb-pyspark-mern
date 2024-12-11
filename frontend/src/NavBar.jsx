import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav style={{ padding: "10px", backgroundColor: "#333", color: "#fff" }}>
      <Link to="/" style={{ marginRight: "15px", color: "#fff" }}>
      <button style={{ padding: "10px", margin: "20px" }}>
          HOME
        </button>
      </Link>
      <Link to="/reviews-graph">
        <button style={{ padding: "10px", margin: "1px" }}>
          Reviews Graph
        </button>
      </Link>
      <Link to="/listings-price-graph">
        <button style={{ padding: "10px", margin: "1px" }}>
          Listings & Price Graph
        </button>
      </Link>
      <Link to="/sentiment-analysis-graph">
        <button style={{ padding: "10px", margin: "1px" }}>
          Sentiment Analysis
        </button>
      </Link>
      <Link to="/room-type-graph">
        <button style={{ padding: "10px", margin: "1px" }}>
          Year vs Room Type
        </button>
      </Link>
    </nav>
  );
}

export default NavBar;
