import { useEffect, useRef, useContext } from "react";
import { GameContext } from "../state/GameContextProvider";
import { socket } from "../App";
import { isContiguous, resetState } from "../utils/utils";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";

export function useSocketHandlers(modalRef) {
  const navigate = useNavigate();
  const gameState = useContext(GameContext);

  // Refs to keep track of game state
  const playerLettersRef = useRef(gameState.playerLetters);
  const bunchTileRef = useRef(gameState.bunchTile);
  const playerNameRef = useRef(gameState.playerName);
  const gridTilesRef = useRef(gameState.gridTiles);

  // Keep refs in sync with game state
  useEffect(() => {
    playerLettersRef.current = gameState.playerLetters;
  }, [gameState.playerLetters]);

  useEffect(() => {
    gridTilesRef.current = gameState.gridTiles;
  }, [gameState.gridTiles]);

  useEffect(() => {
    playerNameRef.current = gameState.playerName;
  }, [gameState.playerName]);

  useEffect(() => {
    bunchTileRef.current = gameState.bunchTile;
  }, [gameState.bunchTile]);

  // Socket event handlers
  useEffect(() => {
    socket.on("initGame", (data) => {
      gameState.setPlayerLetters(data.playerLetters);
      gameState.setTileBag(data.tiles);
      gameState.setGridTiles(data.grid);
    });

    socket.on("receiveSinglePlayerRoom", ({ singlePlayerRooms }) => {
      gameState.setRoom(singlePlayerRooms);
      gameState.setPlayerName("single");
      gameState.setNumberOfPlayers("1");
      gameState.setGoogleId(".");
      const room = singlePlayerRooms;
      const pname = "single";
      const pnum = 1;
      const googleId = ".";
      const single = true;

      socket.emit("joinRoom", { room, pname, pnum, googleId, single });
    });

    // Handle tile draw during a peel
    socket.on("peeldraw", ({ letter }) => {
      gameState.setPlayerLetters((prevLetters) => [...prevLetters, ...letter]);
      gameState.setCanPeel(false);
    });

    // Update player number
    socket.on("updatepnum", (data) => {
      gameState.setNumberOfPlayers(data);
    });
    socket.on("gamestarted", () => {
      gameState.setGameStarted(true);
    });
    // Update the tile bag
    socket.on("updateTileBag", (updatedTiles) => {
      gameState.setTileBag(updatedTiles);
    });

    socket.on("openRoomsUpdate", ({ openRooms }) => {
      gameState.setOpenRooms(openRooms);
    });
    // Handle received messages and show modal if needed
    socket.on("receiveMessage", (data) => {
      if (data.message === "Room full") {
        gameState.setModalMessage("Room full. Please try another room.");

        gameState.setJoined(false);
      } else if (data.message === "Please fill all fields") {
        gameState.setJoined(false);
      } else if (Array.isArray(data.message)) {
        let message = `PLAYERS JOINED: ${data.message.join(", ")}`;

        if (data.pnum !== data.joined) {
          message += `.\nWaiting on ${data.pnum - data.joined} more.`;
        } else {
          gameState.setAllPlayersJoined(true);
        }
        gameState.setModalMessage(message);
      } else if (
        data.message === "Invalid # of players. 2-4 players allowed" ||
        data.message ===
          "Number of players already set for this game. Leave field blank if you want to join this game"
      ) {
        gameState.setModalMessage(data.message);
        gameState.setJoined(false);
      } else if (data.message.includes("won!!")) {
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

        if (!gameState.isSinglePlayer) {
          gameState.setModalMessage(data.message);
        } else {
          gameState.setStop(true);
          const formatTime = (seconds) => {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hrs.toString().padStart(2, "0")}:${mins
              .toString()
              .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
          };

          // navigate("/");
          const storedRecordTime = localStorage.getItem("recordTime");
          const recordTime = storedRecordTime
            ? parseInt(storedRecordTime, 10)
            : null;

          if (!recordTime || gameState.time < recordTime) {
            const oldRecord = recordTime ? formatTime(recordTime) : "none";
            const currentTime = formatTime(gameState.time);

            setTimeout(() => {
              localStorage.setItem("recordTime", gameState.time);
            }, 200);

            gameState.setModalMessage(
              `New Record! Your old best was ${oldRecord}. You finished your crossword in ${currentTime}.`
            );
          } else {
            gameState.setModalMessage(
              `Your time was ${formatTime(gameState.time)}.`
            );
          }
        }
      } else {
        gameState.setModalMessage(data.message);
      }

      if (modalRef.current && !gameState.isSinglePlayer) {
        modalRef.current.showModal();
      }
    });

    // Handle legality of words on the grid
    socket.on("wordLegality", ({ illegal }) => {
      gameState.setIllegalTiles(illegal);

      const allTilesConnected =
        playerLettersRef.current.length === 0 &&
        illegal.length === 0 &&
        !bunchTileRef.current &&
        isContiguous(gridTilesRef.current);

      gameState.setCanPeel(allTilesConnected);
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off("initGame");
      socket.off("updateTileBag");
      socket.off("playerGridUpdated");
      socket.off("receiveMessage");
      socket.off("wordLegality");
      socket.off("peeldraw");
      socket.off("updateOps");
      socket.off("openRoomsUpdate");
      socket.off("gamestarted");
      socket.off("receiveSinglePlayerRoom");
    };
  }, [gameState, modalRef]);
}
