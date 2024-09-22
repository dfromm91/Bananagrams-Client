import Tile from "./Tile";

function TileRack({ letters, onDragStart }) {
  return (
    <div className="tileRack" onDragStart={(e) => onDragStart(e, null, null)}>
      {letters.map((letter, index) => (
        <Tile key={index} letter={letter} index={index} />
      ))}
    </div>
  );
}

export default TileRack;
