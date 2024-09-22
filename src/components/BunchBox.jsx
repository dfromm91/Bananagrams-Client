function BunchBox({ onBunch, BunchDrop, tile, drag }) {
  function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
  }

  return (
    <div
      id="bunchbox"
      className="bunchbox"
      onDrop={BunchDrop}
      onDragOver={handleDragOver}
    >
      <div className="bunchbox-content">
        {tile ? (
          <div className="tile" draggable onDragStart={drag}>
            {tile}
          </div>
        ) : (
          <div className="drop">Drop a tile here</div>
        )}
      </div>
      <button onClick={onBunch} disabled={!tile}>
        Bunch
      </button>
    </div>
  );
}

export default BunchBox;
