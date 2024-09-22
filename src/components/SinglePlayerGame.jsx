import Grid from "./Grid";
import TileRack from "./TileRack";
import BunchBox from "./BunchBox";
import QuitGame from "./QuitGame.jsx";
import { useEffect, useRef } from "react";
import Timer from "./Timer.jsx";
import { useSocketHandlers } from "../hooks/useSocketHandlers.jsx";
import { Navigate, useNavigate } from "react-router-dom";

export default function SinglePlayerGame({
  gameState,
  handlePeel,
  calculateTotalTiles,
  handleDragStart,
  handleDrop,
  handleDragOver,
  handleBunchDrop,
  handleBunch,
  isIllegalTile,
  modalRef,
}) {
  const navigate = useNavigate();
  const singlePlayerModalRef = useRef(null);
  useSocketHandlers(singlePlayerModalRef);
  const quitGameRef = useRef(null);
  useEffect(() => {
    modalRef.current?.showModal();
  }, []);

  function handleClose() {
    singlePlayerModalRef.current.close();
    gameState.setIsSinglePlayer(false);
    navigate("/");
  }

  useEffect(() => {
    if (
      singlePlayerModalRef.current &&
      /\b([0-1]?\d|2[0-3]):([0-5]\d):([0-5]\d)\b/.test(gameState.modalMessage)
    ) {
      singlePlayerModalRef.current.showModal();
    } else {
      singlePlayerModalRef.current.close();
    }
  }, [gameState.modalMessage]);

  return (
    <div>
      <div
        style={{ minHeight: "50px", display: "flex", justifyContent: "center" }}
      >
        {gameState.canPeel && (
          <button
            className="peel"
            onClick={handlePeel}
            style={{ color: "black", backgroundColor: "yellow" }}
          >
            Peel!
          </button>
        )}
        <div className="tileCount">
          Tiles Remaining: {calculateTotalTiles(gameState.tileBag)}
          <QuitGame modalRef={modalRef} single={true} />
          <Timer />
        </div>

        <dialog ref={singlePlayerModalRef} className="modal" open={false}>
          <p>{gameState.modalMessage}</p>
          <button onClick={handleClose}>Close</button>
        </dialog>

        <TileRack
          letters={gameState.playerLetters}
          onDragStart={handleDragStart}
          id="TileRack"
        />
      </div>
      <Grid
        id="Grid"
        gridTiles={gameState.gridTiles}
        onDrop={handleDrop}
        isIllegalTile={isIllegalTile}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
      />
      <BunchBox
        BunchDrop={handleBunchDrop}
        tile={gameState.bunchTile}
        drag={handleDragStart}
        onDragOver={(e) => e.preventDefault()}
        id="bunch"
        onBunch={handleBunch}
      />
    </div>
  );
}
