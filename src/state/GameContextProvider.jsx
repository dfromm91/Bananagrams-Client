import { createContext, useState } from "react";
import OpenRooms from "../components/OpenRooms";

export const GameContext = createContext();

export default function GameContextProvider({ children }) {
  const [playerLetters, setPlayerLetters] = useState([]);
  const [tileBag, setTileBag] = useState({});
  const [room, setRoom] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [bunchTile, setBunchTile] = useState("");
  const [gridTiles, setGridTiles] = useState(
    Array.from({ length: 15 }, () => Array(15).fill(null))
  );
  const [illegalTiles, setIllegalTiles] = useState([]);
  const [draggedTile, setDraggedTile] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [canPeel, setCanPeel] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);
  const [allPlayersJoined, setAllPlayersJoined] = useState(false);
  const [googleId, setGoogleId] = useState(""); // Add googleId state
  const [openRooms, setOpenRooms] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [fromModal, setFromModal] = useState(false);
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [time, setTime] = useState(0);
  const [stop, setStop] = useState(false);
  const gameState = {
    playerLetters,
    setPlayerLetters,
    tileBag,
    setTileBag,
    room,
    setRoom,
    numberOfPlayers,
    setNumberOfPlayers,
    playerName,
    setPlayerName,
    joined,
    setJoined,
    bunchTile,
    setBunchTile,
    gridTiles,
    setGridTiles,
    illegalTiles,
    setIllegalTiles,
    draggedTile,
    setDraggedTile,
    draggedFrom,
    setDraggedFrom,
    canPeel,
    setCanPeel,
    modalMessage,
    setModalMessage,
    allPlayersJoined,
    setAllPlayersJoined,
    googleId, // Include googleId in the context
    setGoogleId, // Include the setter for googleId
    openRooms,
    setOpenRooms,
    gameStarted,
    setGameStarted,
    fromModal,
    setFromModal,
    isSinglePlayer,
    setIsSinglePlayer,
    time,
    setTime,
    stop,
    setStop,
  };

  return (
    <GameContext.Provider value={gameState}>{children}</GameContext.Provider>
  );
}
