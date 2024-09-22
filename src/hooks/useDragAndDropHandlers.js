import { useContext } from "react";
import { GameContext } from "../state/GameContextProvider";

export function useDragAndDropHandlers(socket) {
  const gameState = useContext(GameContext);

  function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
  }

  function handleBunchDrop(e) {
    const s = e.dataTransfer.getData("source-element");
    if (s !== "tile" && !gameState.bunchTile) {
      e.preventDefault();
      const t = e.dataTransfer.getData("tile-letter");
      gameState.setBunchTile(t);
      gameState.setCanPeel(false);
      gameState.setDraggedTile(null);
      gameState.setDraggedFrom(null);

      const tileIndex = e.dataTransfer.getData("tile-index");
      if (s === "tileRack") {
        const newPlayerLetters = gameState.playerLetters.filter(
          (_, index) => index !== parseInt(tileIndex)
        );
        gameState.setPlayerLetters(newPlayerLetters);
      }

      if (s === "grid-cell tile" || s === "grid-cell illegal-tile") {
        const newGridTiles = gameState.gridTiles.map((row, rIndex) =>
          row.map((tile, cIndex) => {
            if (
              rIndex === gameState.draggedFrom.rowIndex &&
              cIndex === gameState.draggedFrom.colIndex
            ) {
              return null;
            } else {
              return tile;
            }
          })
        );

        gameState.setGridTiles(newGridTiles);
        const googleId = gameState.googleId;
        const room = gameState.room;
        const single = gameState.isSinglePlayer;
        socket.emit("updateGrid", { newGridTiles, room, googleId, single });
        gameState.setDraggedTile(null);
        gameState.setDraggedFrom(null);
      }
    }
  }

  function handleDragStart(e, rowIndex, colIndex) {
    if (
      rowIndex !== null &&
      rowIndex !== undefined &&
      colIndex !== null &&
      colIndex != undefined
    ) {
      gameState.setDraggedTile(gameState.gridTiles[rowIndex][colIndex]);
      gameState.setDraggedFrom({ rowIndex, colIndex });
    }
    e.dataTransfer.setData("r", rowIndex);
    e.dataTransfer.setData("c", colIndex);
    const sourceElementId = e.currentTarget.className;
    e.dataTransfer.setData("source-element", sourceElementId);
    e.dataTransfer.setData("tile-letter", e.target.innerText);
  }

  function handleDrop(e, rowIndex, colIndex) {
    const backToRackDiv = document.getElementById("backtorack");
    const source = e.dataTransfer.getData("source-element");
    const tiletext = e.dataTransfer.getData("tile-letter");

    if (e.target === backToRackDiv && source !== "tileRack") {
      gameState.setCanPeel(false);
      gameState.setPlayerLetters((prevLetters) => [...prevLetters, tiletext]);

      if (source !== "tile") {
        const newGridTiles = gameState.gridTiles.map((row, rIndex) =>
          row.map((tile, cIndex) => {
            if (
              rIndex === gameState.draggedFrom.rowIndex &&
              cIndex === gameState.draggedFrom.colIndex
            ) {
              return null;
            } else {
              return tile;
            }
          })
        );

        gameState.setGridTiles(newGridTiles);

        const room = gameState.room;
        const googleId = gameState.googleId;
        const single = gameState.isSinglePlayer;
        socket.emit("updateGrid", { newGridTiles, room, googleId, single });
      }

      gameState.setDraggedTile(null);
      gameState.setDraggedFrom(null);
    } else if (
      rowIndex !== null &&
      rowIndex !== undefined &&
      colIndex !== null &&
      colIndex !== undefined &&
      !gameState.gridTiles[rowIndex][colIndex] &&
      e.target !== backToRackDiv
    ) {
      const tileIndex = e.dataTransfer.getData("tile-index");
      const letter = e.dataTransfer.getData("tile-letter");
      const newGridTiles = gameState.gridTiles.map((row, rIndex) =>
        row.map((tile, cIndex) => {
          if (rIndex === rowIndex && cIndex === colIndex) {
            return gameState.draggedTile || letter;
          } else if (
            gameState.draggedFrom &&
            rIndex === gameState.draggedFrom.rowIndex &&
            cIndex === gameState.draggedFrom.colIndex
          ) {
            return null;
          } else {
            return tile;
          }
        })
      );
      if (source === "tile") {
        gameState.setBunchTile("");
      }
      gameState.setGridTiles(newGridTiles);

      const room = gameState.room;
      const playerLetters = gameState.playerLetters;
      const googleId = gameState.googleId;
      const single = gameState.isSinglePlayer;
      socket.emit("updateGrid", {
        newGridTiles,
        room,
        playerLetters,
        googleId,
        single,
      });

      const newPlayerLetters = gameState.playerLetters.filter(
        (_, index) => index !== parseInt(tileIndex)
      );
      gameState.setPlayerLetters(newPlayerLetters);

      gameState.setDraggedTile(null);
      gameState.setDraggedFrom(null);
    }
  }

  return {
    handleDragOver,
    handleBunchDrop,
    handleDragStart,
    handleDrop,
  };
}
