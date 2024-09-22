import { useContext } from "react";
import { GameContext } from "../state/GameContextProvider";
import { socket } from "../App";

export function isContiguous(grid) {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  // Directions for moving in the grid (up, down, left, right)
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  function isValid(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols;
  }

  function dfs(r, c) {
    visited[r][c] = true;

    for (const [dr, dc] of directions) {
      const newRow = r + dr;
      const newCol = c + dc;

      if (
        isValid(newRow, newCol) &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] !== null
      ) {
        dfs(newRow, newCol);
      }
    }
  }

  // Find the first non-null tile to start DFS
  let startFound = false;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== null) {
        dfs(r, c);
        startFound = true;
        break;
      }
    }
    if (startFound) break;
  }

  // Check if all non-null tiles have been visited
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== null && !visited[r][c]) {
        return false;
      }
    }
  }

  return true;
}
export const isDefaultValue = (value, key) => {
  switch (key) {
    case "playerLetters":
    case "illegalTiles":
    case "openRooms":
      return Array.isArray(value) && value.length === 0; // Default is empty array

    case "tileBag":
      return (
        typeof value === "object" &&
        value !== null &&
        Object.keys(value).length === 0
      ); // Default is empty object

    case "room":
    case "playerName":
    case "googleId":
    case "bunchTile":
      return value === ""; // Default is empty string

    case "numberOfPlayers":
      return value === ""; // Default is empty string (adjust if it's a number)

    case "joined":
    case "canPeel":
    case "allPlayersJoined":
    case "gameStarted":
      return value === false; // Default is false for booleans

    case "gridTiles":
      return (
        Array.isArray(value) &&
        value.every((row) => row.every((cell) => cell === null))
      ); // Default is 15x15 null grid

    case "draggedTile":
    case "draggedFrom":
      return value === null; // Default is null

    case "modalMessage":
      return value === null || value === ""; // Default is null or empty string

    default:
      return false; // If no match, assume it's not the default value
  }
};

export function resetState() {
  const gameState = useContext(GameContext);

  gameState.setPlayerLetters([]);
  gameState.setTileBag({});
  gameState.setRoom("");
  gameState.setpnum("");
  gameState.setpname("");
  gameState.setJoined(false);
  gameState.setBunchTile("");
  gameState.setGridTiles(
    Array.from({ length: 15 }, () => Array(15).fill(null))
  );
  gameState.setIllegalTiles([]);
  gameState.setDraggedTile(null);
  gameState.setDraggedFrom(null);
  gameState.setCanPeel(false);
  gameState.setOpponents([]);
  gameState.setAllIn(false);
  gameState.setIllegalTiles([]);
  socket.disconnect();
  socket.connect();
}

const createModal = (message, buttonConfig = []) => {
  console.log("Creating modal...");
  const modal = document.createElement("dialog");
  modal.className = "modal";

  // Build the modal inner HTML dynamically
  modal.innerHTML = `
    <p>${message}</p>
    <form method="dialog">
      ${buttonConfig
        .map(
          (button) => `
          <button type="button" id="${button.id}">${button.label}</button>
        `
        )
        .join("")}
    </form>
  `;

  // Append modal to the app container
  document.querySelector(".app").appendChild(modal);

  // Show the modal
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    console.error("The browser does not support the showModal method.");
  }

  // Add click event listeners for each button
  buttonConfig.forEach((button) => {
    const buttonElement = document.getElementById(button.id);
    buttonElement?.addEventListener("click", button.onClick);
  });

  // Close the modal when any button is clicked
  buttonConfig.forEach((button) => {
    const buttonElement = document.getElementById(button.id);
    buttonElement?.addEventListener("click", () => modal.close());
  });
};

// Example usage of the createModal function
const openQuitModal = () => {
  createModal("Are you sure you want to quit?", [
    {
      id: "quit-confirm",
      label: "Yes",
      onClick: () => {
        // Handle quit logic here
        console.log("Quitting game...");
      },
    },
    {
      id: "quit-cancel",
      label: "No",
      onClick: () => {
        console.log("Cancel quit.");
      },
    },
  ]);
};
export const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
