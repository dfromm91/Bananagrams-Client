import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./GameSetup.css"; // Ensure the path is correct
import { GameContext } from "../state/GameContextProvider";
import { socket } from "../App";

export default function GameSetup({
  room,
  setRoom,
  playerName,
  setPlayerName,
  numberOfPlayers,
  setNumberOfPlayers,
  joinRoom,
}) {
  const gameState = useContext(GameContext);
  const [showDialog, setShowDialog] = useState(false); // Control modal visibility
  const [selectedRoom, setSelectedRoom] = useState(""); // Store the room user clicked on
  const selectedRoomRef = useRef(selectedRoom);
  // Handle showing the modal when a room is clicked
  const handleRoomClick = (roomName) => {
    setSelectedRoom(roomName); // Store selected room name
    setPlayerName("");
    setNumberOfPlayers("");
    setShowDialog(true); // Show modal
  };
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);
  // Handle the actual joining of the room
  useEffect(() => {
    socket.emit("getOpenRooms");
  }, []);
  const joinExistingGame = () => {
    const pname = gameState.playerName;
    const googleId = gameState.googleId;
    const room = selectedRoomRef.current;

    // Emit "joinRoom" event to join the selected room

    socket.emit("joinRoom", { room, pname, googleId });
    gameState.setRoom(room);
    // Set the player's joined state
    gameState.setJoined(true);
    setShowDialog(false); // Close the dialog after joining
  };

  function OpenRooms({ roomList }) {
    return (
      <>
        {gameState.openRooms && gameState.openRooms.length > 0 ? (
          <>
            <h2 className="open-rooms-title">Open Rooms</h2>
            <ul className="open-rooms-list">
              {roomList.map(
                (room, index) =>
                  room.openSpots > 0 && (
                    <li
                      key={index}
                      className="open-room-item"
                      onClick={() => handleRoomClick(room.name)}
                    >
                      <span
                        className="room-name"
                        style={{ marginRight: "5px" }}
                      >
                        {room.name}
                      </span>
                      <span className="room-spots">
                        {room.openSpots} open spots
                      </span>
                    </li>
                  )
              )}
            </ul>
          </>
        ) : (
          <h2>No Open Rooms</h2>
        )}
      </>
    );
  }

  const handleJoinRoom = () => {
    const googleId = gameState.googleId;
    const room = gameState.room;
    const pnum = gameState.numberOfPlayers;
    const pname = gameState.playerName;

    joinRoom({ room, pname, pnum, googleId });
  };

  return (
    <>
      <div className="game-setup">
        <div className="top-bar">
          <Link to="/" className="home-link">
            Home
          </Link>
        </div>
        <h1>BANANAGRAMS</h1>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={room}
          maxLength={20}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          maxLength={20}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="number"
          placeholder="# of players"
          value={numberOfPlayers}
          onChange={(e) => setNumberOfPlayers(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Create Room</button>
      </div>

      {/* List of open rooms */}
      <OpenRooms roomList={gameState.openRooms} />

      {/* Join room modal */}
      {showDialog && (
        <dialog open>
          <p>Join room: {selectedRoom}</p>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={joinExistingGame} style={{ marginRight: "20px" }}>
            Join
          </button>
          <button onClick={() => setShowDialog(false)}>Cancel</button>
        </dialog>
      )}
    </>
  );
}
