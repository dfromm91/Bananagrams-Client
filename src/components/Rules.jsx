import React from "react";
import "./Rules.css";
import { Link } from "react-router-dom";
function Rules() {
  return (
    <div className="rules-page">
      <div className="top-bar">
        <Link to="/" className="home-link">
          Home
        </Link>
      </div>
      <h1>How to Play Bananagrams Online</h1>
      <p>
        Bananagrams Online is a fast-paced word game where players race to build
        crosswords using letter tiles. Here's a step-by-step guide to help you
        get started:
      </p>

      <h2>1. Logging In and Starting a Game</h2>
      <p>
        To begin, log in with your Google account. Once logged in, press the
        "Setup/Join Game" button.
      </p>

      <h3>Creating a Room</h3>
      <p>
        If you're creating a room, enter a room ID (this is the code you'll
        share with your friends so they can join), choose a display name, and
        set the number of players. Once all the players have joined, the game
        will start.
      </p>

      <h3>Joining a Room</h3>
      <p>
        If you're joining a room created by a friend, get the room ID from them,
        enter it, and leave the number of players field blank. Enter your
        display name, and wait for the game to start once everyone has joined.
      </p>

      <h2>2. Playing the Game</h2>
      <p>
        Once the game begins, your goal is to use all your letter tiles to
        create a valid, connected crossword on the grid as quickly as possible.
      </p>

      <h3>Peeling (Getting More Tiles)</h3>
      <p>
        When you’ve successfully used all your tiles to create a valid
        crossword, the “Peel” button will appear. Click this button, and every
        player in the game will receive one new letter tile.
      </p>

      <h3>Bunching (Exchanging Tiles)</h3>
      <p>
        If you have a tile you can’t use, you can exchange it by dragging it
        into the bunch box and clicking the “Bunch” button. This will discard
        the tile and give you three new tiles. Only you will receive these new
        tiles.
      </p>

      <h2>3. Winning the Game</h2>
      <p>
        The game continues until someone peels, but there aren't enough tiles
        left for all players to receive one. When this happens, the player who
        peeled wins the game.
      </p>

      <h2>Key Gameplay Tips</h2>
      <ul>
        <li>
          Drag and drop tiles from your tile rack into the grid to form words.
        </li>
        <li>Make sure your crossword is valid and connected before peeling.</li>
        <li>
          If you make a mistake, you can drag tiles back to the rack or move
          them elsewhere on the grid.
        </li>
        <li>
          Bunch wisely! It can help you get out of a tough spot, but remember,
          only you get the new tiles.
        </li>
      </ul>

      <p>
        That’s all there is to it! Now that you know the rules, it’s time to
        challenge your friends and race to see who can build the best crossword
        the fastest.
      </p>
    </div>
  );
}

export default Rules;
