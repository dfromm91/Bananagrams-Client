import { useRef, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import GamePlay from "./components/GamePlay";
import GameSetup from "./components/GameSetup";
import { GameContext } from "./state/GameContextProvider";
import { useSocketHandlers } from "./hooks/useSocketHandlers";
import { useDragAndDropHandlers } from "./hooks/useDragAndDropHandlers";
import { useGameEventHandlers } from "./hooks/useGameEventHandlers";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Profile from "./components/Profile";
import { Link } from "react-router-dom";
import Rules from "./components/Rules";
import "./HomePage.css";
import { isDefaultValue } from "./utils/utils";

import SinglePlayerGame from "./components/SinglePlayerGame";
// Initialize socket connection
export const socket = io.connect("https://bananagram-api2.onrender.com");
// export const socket = io.connect("http://localhost:3002");

function App() {
  const OAuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("jwtToken", token); // Store the token
        navigate("/"); // Redirect to profile or homepage
      }
    }, [location, navigate]);

    return null; // Optionally, show a loading indicator here
  };

  const gameState = useContext(GameContext);
  const modalRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(loaded);
  const stateRef = useRef(gameState);
  const [isRestored, setIsRestored] = useState(false);
  const navigate = useNavigate();
  const fromModalRef = useRef(gameState.fromModal);
  const singlePlayerRef = useRef(gameState.isSinglePlayer);
  useEffect(() => {
    singlePlayerRef.current = gameState.isSinglePlayer;
  }, [gameState.isSinglePlayer]);
  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    fromModalRef.current = gameState.fromModal;
  }, [gameState.fromModal]);

  // Get drag and drop handlers
  const { handleDragOver, handleBunchDrop, handleDragStart, handleDrop } =
    useDragAndDropHandlers(socket);

  // Get game event handlers
  const {
    handleBunch,
    handlePeel,
    calculateTotalTiles,
    joinRoom, // Ensure joinRoom is correctly passed down
    isIllegalTile,
  } = useGameEventHandlers(socket);

  // Fetch authentication status
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      fetch("https://auth-zb77.onrender.com/auth/google/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the JWT in the Authorization header
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP status ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
            setUser(data.user);

            if (data.user && data.user.googleId) {
              gameState.setGoogleId(data.user.googleId);
            }
          }
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  }, []);

  //////////////////////state preservation ///////////////////////
  useEffect(() => {
    // Filter out any keys that hold their default value

    const stateToStore = Object.keys(gameState).reduce((acc, key) => {
      if (
        !key.startsWith("set") &&
        key !== "googleId" &&
        key !== "numberOfPlayers" &&
        key !== "fromModal" &&
        key !== "openRooms" &&
        key !== "time" &&
        key !== "isSinglePlayer" &&
        key !== "stop" &&
        !isDefaultValue(gameState[key], key)
      ) {
        acc[key] = gameState[key]; // Only store non-default values
      }
      return acc;
    }, {});

    if (Object.keys(stateToStore).length !== 0) {
      localStorage.setItem("gameState", JSON.stringify(stateToStore));
    }
  }, [gameState]); // Check if gameState is updating as expected

  // Restore gameState from localStorage on app load
  useEffect(() => {
    const savedGameState = JSON.parse(localStorage.getItem("gameState"));

    if (savedGameState) {
      // Restore the saved state values using the setters
      Object.keys(savedGameState).forEach((key) => {
        const setter = gameState[`set${capitalizeFirstLetter(key)}`];
        if (typeof setter === "function") {
          setter(savedGameState[key]);
        }
      });
      socket.on("connection", () => {});
      // Once all states are restored, set the restoration flag to true

      setTimeout(() => {
        const room = savedGameState.room;
        const pname = savedGameState.playerName;
        const googleId = savedGameState.googleId;
        const gameStarted = savedGameState.gameStarted;
        const pnum = savedGameState.numberOfPlayers;

        if (
          !(
            parseInt(savedGameState.room) &&
            savedGameState.playerName === "single"
          )
        ) {
          navigate("/bananagrams");
          if (savedGameState.gameStarted) {
            setTimeout(() => {
              socket.emit("joinRoom", {
                room,
                gameStarted,
                googleId,
                pname,
                pnum,
              });
            }, 500);
          }

          setIsRestored(true);
        } else {
          gameState.setJoined(false);
          gameState.setPlayerLetters([]);
          gameState.setTileBag({});
          gameState.setRoom("");
          gameState.setNumberOfPlayers("");
          gameState.setPlayerName("");
          gameState.setBunchTile("");
          gameState.setGridTiles(
            Array.from({ length: 15 }, () => Array(15).fill(null))
          );
          gameState.setIllegalTiles([]);
          gameState.setDraggedTile(null);
          gameState.setGameStarted(false);
          gameState.setDraggedFrom(null);
          gameState.setCanPeel(false);
          gameState.setAllPlayersJoined(false);
          gameState.setIllegalTiles([]);
          gameState.setModalMessage("");
          setTimeout(() => {
            navigate("/");
          }, 100);
        }
      }, 200); // Small delay to allow state updates to propagate
    } else {
      // If no saved state, consider restoration complete immediately
      setIsRestored(true);
    }
    setLoaded(true);
  }, []);

  // Helper function to capitalize first letter of keys for setters
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  /////////////////////////////////////////////////////////////////

  return (
    <Routes>
      {/* Home Page */}
      <Route
        path="/"
        element={
          <Home
            isAuthenticated={isAuthenticated}
            user={user}
            setIsAuthenticated={setIsAuthenticated}
            setUser={setUser}
          />
        }
      />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Profile Page */}
      <Route
        path="/profile/:googleId"
        element={
          isAuthenticated ? (
            <Profile googleId={user.googleId} name={user.displayName} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      {/* Rules Page Route */}
      <Route path="/rules" element={<Rules />} />
      <Route
        path="/singleplayer"
        element={
          <SinglePlayerGame
            gameState={gameState}
            handlePeel={handlePeel}
            calculateTotalTiles={calculateTotalTiles}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleBunchDrop={handleBunchDrop}
            handleBunch={handleBunch}
            isIllegalTile={isIllegalTile}
            modalRef={modalRef}
          />
        }
      />

      {/* Protected Game Route */}
      <Route
        path="/bananagrams"
        element={
          isAuthenticated ? (
            <Game
              gameState={gameState}
              joinRoom={joinRoom} // Passing joinRoom to the Game component
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleBunchDrop={handleBunchDrop}
              handleBunch={handleBunch}
              handlePeel={handlePeel}
              calculateTotalTiles={calculateTotalTiles}
              handleDragStart={handleDragStart}
              isIllegalTile={isIllegalTile}
              modalRef={modalRef}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route path="*" element={<h1>Not Here Buddy</h1>} />
    </Routes>
  );
}

// Home component, acts as the landing page
function Home({ isAuthenticated, user, setIsAuthenticated, setUser }) {
  const gameState = useContext(GameContext);
  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); // Remove the token from localStorage
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  const handleSetupJoinGame = () => {
    navigate("/bananagrams");
  };
  const handleSinglePlayerGame = () => {
    navigate("/singleplayer");
    gameState.setIsSinglePlayer(true);
    socket.emit("getSinglePlayerRoom");
  };

  useEffect(() => {
    fetch("https://auth-zb77.onrender.com/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));
  }, []);

  return (
    <div className="home-page">
      <div className="top-bar">
        {isAuthenticated && user && (
          <>
            <Link to={`/profile/${user.googleId}`} className="user-name">
              {/* {user.displayName} */}
              Profile
            </Link>
            <a
              style={{ cursor: "pointer" }}
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </a>
          </>
        )}
        <Link to="/rules">How to Play</Link>
      </div>

      <h1>Welcome to Bananagrams</h1>
      {isAuthenticated ? (
        <button onClick={handleSetupJoinGame} style={{ marginRight: "10px" }}>
          Multiplayer Game
        </button>
      ) : (
        <button
          style={{ marginRight: "10px" }}
          onClick={() => {
            // Redirect user to the Google OAuth URL via your server
            window.location.href = "https://auth-zb77.onrender.com/auth/google";
          }}
        >
          Login for Multiplayer
        </button>
      )}
      <button onClick={handleSinglePlayerGame}>Single Player Game</button>

      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
}

function Leaderboard({ leaderboard }) {
  return (
    <div className="leaderboard">
      <h2>Leaderboard - Top Players</h2>
      <ul>
        {leaderboard.map((player, index) => (
          <li key={index}>
            {index + 1}. {player.displayName} - {player.wins} wins
          </li>
        ))}
      </ul>
    </div>
  );
}

// Game component that handles both setup and gameplay
function Game({
  gameState,
  joinRoom,
  handleDragOver,
  handleDrop,
  handleDragStart,
  handleBunchDrop,
  handleBunch,
  handlePeel,
  calculateTotalTiles,
  isIllegalTile,
  modalRef,
}) {
  useSocketHandlers(modalRef);
  const [quitPressed, setQuitPressed] = useState(false);
  const createModal = () => {
    const modal = document.createElement("dialog");
    modal.className = "modal";
    modal.innerHTML = `
    <p>${gameState.modalMessage}</p>
  
    ${
      !gameState.allPlayersJoined && gameState.joined
        ? '<button id="quit-game-btn">Quit Game</button>'
        : ""
    }
  
    <form method="dialog">
      ${
        !gameState.joined || (gameState.joined && gameState.allPlayersJoined)
          ? "<button>" +
            (gameState.allPlayersJoined ? "PLAY" : "OK") +
            "</button>"
          : ""
      }
    </form>
  `;

    // Attach event listener for the Quit button dynamically
    const quitButton = modal.querySelector("#quit-game-btn");

    if (quitButton) {
      quitButton.addEventListener("click", handleQuitGame);
    }

    document.querySelector(".app").appendChild(modal);

    modalRef.current = modal;

    // Ensure the modal is shown
    if (typeof modal.showModal === "function") {
      modal.showModal(); // Use showModal to open the dialog as a modal
    } else {
      console.error("The browser does not support the showModal method.");
    }
  };

  // UseEffect to monitor the modal element
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const modal = document.querySelector(".modal");
      if (!modal) {
        // If the modal is removed, re-create it
        createModal();
      }
    });

    // Start observing the DOM for changes
    observer.observe(document.querySelector(".app"), {
      childList: true,
      subtree: true,
    });

    // Cleanup the observer on component unmount
    return () => observer.disconnect();
  }, [gameState.modalMessage, gameState.joined, gameState.allPlayersJoined]);

  const handleQuitGame = () => {
    modalRef.current.close(); // Close the main modal when "Quit" is clicked
    setQuitPressed(true);
    gameState.setFromModal(true);
  };

  return (
    <div id="backtorack" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="app">
        <dialog ref={modalRef} className="modal">
          <p>{gameState.modalMessage}</p>

          {!gameState.allPlayersJoined && gameState.joined && (
            <>
              <button onClick={handleQuitGame}>Quit Game</button>
            </>
          )}

          <form method="dialog">
            {(!gameState.joined ||
              (gameState.joined && gameState.allPlayersJoined)) && (
              <button>{gameState.allPlayersJoined ? "PLAY" : "OK"}</button>
            )}
          </form>
        </dialog>
        {/* {quitPressed && (
          <div>
            <QuitGame source={"modal"} />
          </div>
        )} */}
        {!gameState.joined ? (
          <GameSetup
            room={gameState.room}
            setRoom={gameState.setRoom}
            playerName={gameState.playerName}
            setPlayerName={gameState.setPlayerName}
            numberOfPlayers={gameState.numberOfPlayers}
            setNumberOfPlayers={gameState.setNumberOfPlayers}
            joinRoom={joinRoom} // Pass joinRoom to GameSetup
          />
        ) : (
          <GamePlay
            gameState={gameState}
            handlePeel={handlePeel}
            calculateTotalTiles={calculateTotalTiles}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleBunchDrop={handleBunchDrop}
            handleBunch={handleBunch}
            isIllegalTile={isIllegalTile}
            modalRef={modalRef}
          />
        )}
      </div>
    </div>
  );
}

export default App;
