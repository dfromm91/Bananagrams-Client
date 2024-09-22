function Grid({ gridTiles, onDrop, onDragStart, onDragOver, isIllegalTile }) {
  return (
    <div className="grid">
      {gridTiles.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.map((tile, colIndex) => (
            <div
              key={colIndex}
              className={`grid-cell ${
                isIllegalTile(rowIndex, colIndex)
                  ? "illegal-tile"
                  : tile
                  ? "tile"
                  : ""
              }`}
              draggable={tile !== null} // Make cells with tiles draggable
              onDrop={(e) => onDrop(e, rowIndex, colIndex)}
              onDragOver={(e) => onDragOver(e, rowIndex, colIndex)}
              onDragStart={(e) => onDragStart(e, rowIndex, colIndex)}
            >
              {tile}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Grid;
