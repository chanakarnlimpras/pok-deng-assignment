import { useState } from "react";

import "./App.css";
import { createGame, performAction } from "./services/gameService";
import type { GameSession } from "./type/game";

function App() {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [cutAmount, setCutAmount] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(0);

  const handleStartGame = async () => {
    if (initialBalance <= 0) {
      alert("Please enter a valid initial balance.");
      return;
    }
    try {
      const res = await createGame(initialBalance);
      console.log("full response:", res);
      console.log("gameSession:", res.data);

      const session = res.gameSession;
      console.log("session:", session);

      setGameSession(session);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };
  const handleCutDeck = async (amount: number) => {
    try {
      const res = await performAction(gameSession?.gameId ?? "", "CUT", amount);
      console.log("full response:", res);
      console.log("gameSession:", res.data);

      const session = res.gameSession;
      console.log("session:", session);

      setGameSession(session);
    } catch (error) {
      console.error("Error cutting deck:", error);
    }
  };

  const handleBet = async (amount: number) => {
    try {
      const res = await performAction(gameSession?.gameId ?? "", "BET", amount);
      console.log("full response:", res);
      console.log("gameSession:", res.data);

      const session = res.gameSession;
      console.log("session:", session);

      setGameSession(session);
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  const handleDraw = async () => {
    try {
      const res = await performAction(gameSession?.gameId ?? "", "DRAW");
      console.log("full response:", res);
      console.log("gameSession:", res.data);

      const session = res.gameSession;
      console.log("session:", session);

      setGameSession(session);
    } catch (error) {
      console.error("Error drawing card:", error);
    }
  };

  const handleStay = async () => {
    try {
      const res = await performAction(gameSession?.gameId ?? "", "STAY");
      console.log("full response:", res);
      console.log("gameSession:", res.data);

      const session = res.gameSession;
      console.log("session:", session);

      setGameSession(session);
    } catch (error) {
      console.error("Error staying:", error);
    }
  };

  if (!gameSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <input
          type="number"
          placeholder="init amount"
          value={initialBalance}
          onChange={(e) => setInitialBalance(Number(e.target.value))}
        />
        <button
          onClick={handleStartGame}
          className="px-4 py-2 text-lg font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1>Current Game Id: {gameSession.gameId}</h1>
        <h2>Current Game State: {gameSession.state}</h2>

        {gameSession.state === "WAITING_FOR_CUT" && (
          <div>
            <p>Balance: {gameSession.balance}</p>
            <input
              type="number"
              placeholder="cut amount"
              value={cutAmount}
              onChange={(e) => setCutAmount(Number(e.target.value))}
            />
            <button
              onClick={() => {
                handleCutDeck(cutAmount);
              }}
            >
              Cut Deck
            </button>
          </div>
        )}

        {gameSession.state === "WAITING_FOR_BET" && (
          <div>
            <p>Balance: {gameSession.balance}</p>
            <input
              type="number"
              placeholder="bet amount"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
            />
            <button
              onClick={() => {
                handleBet(betAmount);
              }}
            >
              Bet Money
            </button>
          </div>
        )}
        {gameSession.state === "WAITING_FOR_DECISION" && (
          <div>
            <p>Balance: {gameSession.balance}</p>
            <p>
              Player Hand:{" "}
              {gameSession.playerHand
                .map((card) => `${card.rank} of ${card.suit}`)
                .join(", ")}
            </p>
            <p>Player Score: {gameSession.playerScore}</p>
            <p>Player Bet Amount: {gameSession.playerBet}</p>

            <div className="flex gap-4 ">
              <button
                className="bg-pink-500"
                onClick={() => {
                  handleDraw();
                }}
              >
                Draw
              </button>
              <button
                className="bg-green-500"
                onClick={() => {
                  handleStay();
                }}
              >
                Stay
              </button>
            </div>
          </div>
        )}

        {gameSession.state === "ROUND_END" && (
          <div>
            <p>Balance: {gameSession.balance}</p>
            <p>
              Player Hand:{" "}
              {gameSession.playerHand
                .map((card) => `${card.rank} of ${card.suit}`)
                .join(", ")}
            </p>
            <p>Player Score: {gameSession.playerScore}</p>

            <p>
              Dealer Hand:{" "}
              {gameSession.dealerHandVisible
                .map((card) => `${card.rank} of ${card.suit}`)
                .join(", ")}
            </p>
            <p>Dealer Score: {gameSession.dealerScore}</p>

            <h3>Winner: {gameSession.winner}</h3>
            <h3>Prize: {gameSession.prize}</h3>
          </div>
        )}
       
      </div>
    </>
  );
}

export default App;
