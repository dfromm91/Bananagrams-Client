import React, { useState, useEffect, useContext } from "react";
import { GameContext } from "../state/GameContextProvider";

const Timer = () => {
  const gameState = useContext(GameContext);
  useEffect(() => {
    gameState.setTime(0);
    gameState.setStop(false);
  }, []);
  useEffect(() => {
    if (!gameState.stop) {
      const timerId = setInterval(() => {
        gameState.setTime((prevTime) => prevTime + 1);
      }, 1000);

      // Cleanup the interval when the component unmounts
      return () => clearInterval(timerId);
    }
  }, [gameState.stop]);

  // Convert seconds to a more readable format (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h2>{formatTime(gameState.time)}</h2>
    </div>
  );
};

export default Timer;
