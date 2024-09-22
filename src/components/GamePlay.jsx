import Grid from "./Grid";
import TileRack from "./TileRack";
import BunchBox from "./BunchBox";
import QuitGame from "./QuitGame.jsx";
import { useEffect } from "react";

export default function GamePlay({
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
  useEffect(() => {
    modalRef.current?.showModal();
  }, []);
  return (
    <>
      <div style={{ minHeight: "50px" }}>
        {gameState.canPeel && (
          <button className="peel" onClick={handlePeel}>
            Peel!
          </button>
        )}
        <div className="tileCount">
          Tiles Remaining: {calculateTotalTiles(gameState.tileBag)}
          <QuitGame modalRef={modalRef} />
        </div>
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
    </>
  );
}
