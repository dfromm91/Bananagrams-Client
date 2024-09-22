import React, { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../state/GameContextProvider";
import { socket } from "../App";
import { Navigate, useNavigate } from "react-router-dom";

function QuitGame({ modalRef, single = false }) {
  const gameState = useContext(GameContext);
  const [showDialog, setShowDialog] = useState(false); // State to control dialog visibility
  const dialogRef = useRef(null); // Reference for the dialog
  const tileCountRef = useRef(
    Object.values(gameState.tileBag).reduce((total, count) => total + count, 0)
  );
  const [quitClicked, setQuitClicked] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    tileCountRef.current = Object.values(gameState.tileBag).reduce(
      (total, count) => total + count,
      0
    );
  }, [gameState.tileBag]);
  // Function to recreate the dialog if it gets deleted
  const recreateDialog = () => {
    const dialog = document.createElement("dialog");
    dialog.id = "quit-confirm"; // Add any class if needed
    dialog.innerHTML = `
        <p>Are you sure you want to quit?</p>
        <button id="quitBtn">Yes</button>
        <button id="cancelBtn">No</button>
      `;

    // Append the dialog directly to the .app container
    const appDiv = document.querySelector(".app");
    if (appDiv) {
      appDiv.appendChild(dialog);
      dialogRef.current = dialog;
      dialogRef.current.showModal();

      // Re-attach event listeners for quit and close actions
      dialog.querySelector("#quitBtn").addEventListener("click", quit);
      dialog.querySelector("#cancelBtn").addEventListener("click", closeDialog);
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const modal = document.querySelector("#quit-confirm");
      if (!modal && tileCountRef.current > 0) {
        // If the modal is removed, re-create it

        recreateDialog();
      }
    });

    // Start observing the DOM for changes
    observer.observe(document.querySelector("#root"), {
      childList: true,
      subtree: true,
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // Effect to handle showing the dialog when triggered from the modal
  useEffect(() => {
    if (gameState.fromModal) {
      if (dialogRef.current) {
        dialogRef.current.showModal(); // Open the dialog as a modal
      }
    }
  }, [gameState.fromModal]);
  useEffect(() => {
    if (quitClicked) {
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
      gameState.setIsSinglePlayer(false);
      navigate("/");
    }
  }, [quitClicked]);
  const quit = () => {
    const room = gameState.room;
    const googleId = gameState.googleId;
    setQuitClicked(true);
    // Emit a "leaveRoom" event instead of disconnecting the socket
    socket.emit("leaveRoom", { room, googleId });

    // Set the player's joined state to false
    gameState.setIllegalTiles([]);
    gameState.setJoined(false);
    gameState.setAllPlayersJoined(false);
    gameState.setFromModal(false);
    gameState.setGameStarted(false);
    gameState.setCanPeel(false);
    gameState.setBunchTile("");
    gameState.setRoom("");
    gameState.setPlayerName("");
    // Safely close the dialog if it's still in the DOM
    if (dialogRef.current && document.body.contains(dialogRef.current)) {
      dialogRef.current.close();
    }

    setShowDialog(false);
  };

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal(); // Open the dialog as a modal
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    if (modalRef.current && !gameState.allPlayersJoined) {
      modalRef.current.showModal(); // Reopen the main modal
    }
    if (dialogRef.current && document.body.contains(dialogRef.current)) {
      dialogRef.current.close(); // Close without quitting
    }
    gameState.setFromModal(false);
  };

  return (
    <div id="quit-game-root">
      <button onClick={openDialog}>Quit Game</button>

      {/* Modal dialog */}
      <dialog id="quit-confirm" ref={dialogRef}>
        <p>Are you sure you want to quit?</p>
        <button id="quitBtn" onClick={quit}>
          Yes
        </button>
        <button id="cancelBtn" onClick={closeDialog}>
          No
        </button>
      </dialog>
    </div>
  );
}

export default QuitGame;
