import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../state/GameContextProvider";

export function useGameEventHandlers(socket) {
  const gameState = useContext(GameContext);
  const bunchTileRef = useRef(gameState.bunchTile);
  const singlePlayerRef = useRef(gameState.isSinglePlayer);
  useEffect(() => {
    bunchTileRef.current = gameState.bunchTile;
  }, [gameState.bunchTile]);
  useEffect(() => {
    singlePlayerRef.current = gameState.isSinglePlayer;
  }, [gameState.isSinglePlayer]);

  function joinRoom() {
    if (gameState.room && gameState.playerName) {
      const room = gameState.room;
      const pnum = gameState.numberOfPlayers;
      const pname = gameState.playerName;
      const googleId = gameState.googleId;
      socket.emit("joinRoom", { room, pname, pnum, googleId });
      gameState.setJoined(true);
    }
  }
  function handleBunch() {
    if (calculateTotalTiles(gameState.tileBag) > 1) {
      const room = gameState.room;
      const single = singlePlayerRef.current;
      socket.emit("bunch", { room, bunchTileRef, single });
      gameState.setBunchTile("");
    }
  }

  function handlePeel() {
    const room = gameState.room;
    const pname = gameState.playerName;
    const id = gameState.googleId;
    const single = gameState.isSinglePlayer;

    socket.emit("peelclicked", { room, pname, id, single });
    gameState.setCanPeel(false);
  }

  function calculateTotalTiles(tiles) {
    return Object.values(tiles).reduce((total, count) => total + count, 0);
  }

  // Function to check if a tile is illegal based on its coordinates
  function isIllegalTile(rowIndex, colIndex) {
    return gameState.illegalTiles.some((words) =>
      words.some(([row, col]) => row === rowIndex && col === colIndex)
    );
  }

  return {
    joinRoom,
    handleBunch,
    handlePeel,
    calculateTotalTiles,
    isIllegalTile,
  };
}
