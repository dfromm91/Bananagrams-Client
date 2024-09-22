function Tile({ letter, index }) {
  function handleDragStart(e) {
    e.dataTransfer.setData("tile-index", index);
    e.dataTransfer.setData("tile-letter", letter);
  }

  return (
    <div className="tile" draggable onDragStart={handleDragStart}>
      {letter}
    </div>
  );
}

export default Tile;
