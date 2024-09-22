import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./Profile.css"; // Import the CSS file
import { formatTime } from "../utils/utils";

// Register components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

function Profile({ googleId, name }) {
  const [userStats, setUserStats] = useState({ wins: 0, losses: 0 });

  useEffect(() => {
    // Fetch the player's wins and losses using googleId
    fetch(`https://auth-zb77.onrender.com/profile/${googleId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserStats({ wins: data.wins, losses: data.losses });
      })
      .catch((err) => console.error("Error fetching user stats:", err));
  }, [googleId]);

  // Prepare data for the pie chart
  const data = {
    labels: ["Wins", "Losses"],
    datasets: [
      {
        data: [userStats.wins, userStats.losses],
        backgroundColor: ["#28a745", "#dc3545"], // Money green and strong red
        hoverBackgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  };

  // Chart options to disable the legend
  const options = {
    plugins: {
      legend: {
        display: false, // Disable the legend
      },
    },
  };

  return (
    <div className="profile-page">
      <div className="top-bar">
        <Link to="/" className="home-link">
          Home
        </Link>
      </div>
      <h1>Statistics for {name}</h1>
      <div className="pie-chart-container">
        <Pie data={data} options={options} />
      </div>
      <p className="stats-title">Your Performance</p>
      <p>
        Wins: <span>{userStats.wins}</span>
      </p>
      <p className="losses">Losses: {userStats.losses}</p>

      <p>
        Best Single Player Time:{" "}
        {localStorage.getItem("recordTime")
          ? formatTime(localStorage.getItem("recordTime"))
          : "Not Set"}
      </p>
    </div>
  );
}

export default Profile;
