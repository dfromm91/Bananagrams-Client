export default function OpenRooms({
  roomList = [{ name: "test", openSpots: 3 }],
}) {
  function handleRoomClick(e) {}
  return (
    <>
      <h2 style={{ color: "white" }}>Open Rooms:</h2>
      <ul>
        {roomList.map(
          (room, index) =>
            room.openSpots > 0 && (
              <li key={index} onClick={handleRoomClick}>
                {room.name}: {room.openSpots} open spots
              </li>
            )
        )}
      </ul>
    </>
  );
}
