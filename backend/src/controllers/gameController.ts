import { Request, Response } from "express";
import {
  Card,
  CreateGameRequest,
  GameSession,
  GameSessionResponse,
  PerformActionRequest,
} from "../types/game";
import {
  createGameSession,
  dealerPlayTurn,
  getGameSessionById,
  toGameSessionResponse,
} from "../services/gameService";
import { calculateScore, cutDeck, dealCards, drawCard } from "../utils/game";

export const hello = (req: any, res: any) => {
  res.send("Hello World!");
};

export const createGameController = (
  req: Request<{}, {}, CreateGameRequest>,
  res: Response<any>,
) => {
  const { initialBalance } = req.body;

  const gameSession = createGameSession(initialBalance);

  return res.status(201).json({
    message: "Game session created successfully",
    gameSession: toGameSessionResponse(gameSession),
  });
};
export const getGameController = (
  req: Request<{ gameId: string }, {}, {}>,
  res: Response<GameSession | { message: string }>,
) => {
  const { gameId } = req.params;
  const gameSession = getGameSessionById(gameId);
  if (!gameSession) {
    return res.status(404).json({ message: "ERR_SESSION_NOT_FOUND" });
  }
  return res.status(200).json(gameSession);
};

export const performActionController = (
  req: Request<{ gameId: string }, {}, PerformActionRequest>,
  res: Response<any>,
) => {
  const { gameId } = req.params;
  const { action, amount } = req.body;

  const gameSession = getGameSessionById(gameId);
  if (!gameSession) {
    return res.status(404).json({ message: "ERR_SESSION_NOT_FOUND" });
  }
  console.log("Game session (Before action):", {
    gameState: gameSession.state,
    deck: gameSession.deck,
    playerHand: gameSession.playerHand,
    dealerHand: gameSession.dealerHand,
  });
  console.log("hi");
  switch (action) {
    case "CUT": // required amount
      if (gameSession.state !== "WAITING_FOR_CUT") {
        return res.status(400).json({ message: "ERR_INVALID_STATE" });
      }
      if (!amount || amount <= 0 || amount > 52) {
        return res.status(400).json({ message: "ERR_INVALID_AMOUNT" });
      }
      gameSession.state = "WAITING_FOR_BET";

      gameSession.deck = cutDeck(gameSession.deck, amount);
      return res.status(200).json({
        message: "Deck cut successfully",
        gameSession: toGameSessionResponse(gameSession),
      });

    case "BET": // required amount
      if (gameSession.state !== "WAITING_FOR_BET") {
        return res.status(400).json({ message: "ERR_INVALID_STATE" });
      }
      if (!amount || amount <= 0 || amount > gameSession.balance) {
        return res.status(400).json({ message: "ERR_INVALID_AMOUNT" });
      }
      gameSession.playerBet = amount;
      gameSession.balance -= amount;
      gameSession.state = "WAITING_FOR_DECISION";

      dealCards(gameSession, 2);

      gameSession.playerScore = calculateScore(gameSession.playerHand);
      gameSession.dealerScore = calculateScore(gameSession.dealerHand);
      if (
        calculateScore(gameSession.dealerHand) == 8 ||
        calculateScore(gameSession.dealerHand) == 9
      ) {
        gameSession.state = "ROUND_END";
        return res.status(200).json({
          message: "Dealer win!",
          gameSession: toGameSessionResponse({
            ...gameSession,

            winner: "Dealer",
          }),
        });
      }
      if (
        calculateScore(gameSession.playerHand) == 8 ||
        calculateScore(gameSession.playerHand) == 9
      ) {
        gameSession.state = "ROUND_END";
        return res.status(200).json({
          message: "Player win!",
          gameSession: {
            ...gameSession,

            winner: "Player",
          },
        });
      }

      return res.status(200).json({
        message: "Bet placed successfully",
        gameSession: {
          ...gameSession,
        },
      });

    case "DRAW":
      if (gameSession.state !== "WAITING_FOR_DECISION") {
        return res.status(400).json({ message: "ERR_INVALID_STATE" });
      }
      const drawnCard = drawCard(gameSession.deck);
      gameSession.playerHand.push(drawnCard);

      gameSession.state = "DEALER_TURN";
      dealerPlayTurn(gameSession);
      gameSession.state = "ROUND_END";
      if (
        calculateScore(gameSession.dealerHand) >=
        calculateScore(gameSession.playerHand)
      ) {
        return res.status(200).json({
          message: "Dealer win!",
          playerScore: calculateScore(gameSession.playerHand),
          dealerScore: calculateScore(gameSession.dealerHand),
          playerHand: gameSession.playerHand,
          dealerHandVisible: gameSession.dealerHand,
          winner: "Dealer",
        });
      } else {
        return res.status(200).json({
          message: "Player win!",
          playerScore: calculateScore(gameSession.playerHand),
          dealerScore: calculateScore(gameSession.dealerHand),
          playerHand: gameSession.playerHand,
          dealerHandVisible: gameSession.dealerHand,
          winner: "Player",
        });
      }

    case "STAY":
      if (gameSession.state !== "WAITING_FOR_DECISION") {
        return res.status(400).json({ message: "ERR_INVALID_STATE" });
      }

      gameSession.state = "DEALER_TURN";

      dealerPlayTurn(gameSession);
      gameSession.state = "ROUND_END";

      if (
        calculateScore(gameSession.dealerHand) >
        calculateScore(gameSession.playerHand)
      ) {
        return res.status(200).json({
          message: "Dealer Win",
          gameSession: {
            ...gameSession,
            playerScore: calculateScore(gameSession.playerHand),
            dealerScore: calculateScore(gameSession.dealerHand),
            playerHand: gameSession.playerHand,
            dealerHandVisible: gameSession.dealerHand,
            winner: "Dealer",
            prize: 0,
          },
        });
      } else if (
        calculateScore(gameSession.dealerHand) ===
        calculateScore(gameSession.playerHand)
      ) {
        return res.status(200).json({
          message: "Tie",
          gameSession: {
            ...gameSession,
            playerScore: calculateScore(gameSession.playerHand),
            dealerScore: calculateScore(gameSession.dealerHand),
            playerHand: gameSession.playerHand,
            dealerHandVisible: gameSession.dealerHand,
            winner: "Tie",
            prize: gameSession.playerBet,
          },
        });
      } else {
        return res.status(200).json({
          message: "Player Win",
          gameSession: {
            ...gameSession,
            playerScore: calculateScore(gameSession.playerHand),
            dealerScore: calculateScore(gameSession.dealerHand),
            playerHand: gameSession.playerHand,
            dealerHandVisible: gameSession.dealerHand,
            winner: "Player",
            prize: gameSession.playerBet * 2,
          },
        });
      }

    case "NEXT_ROUND":
      if (gameSession.state !== "ROUND_END") {
        return res.status(400).json({ message: "ERR_INVALID_STATE" });
      }
      gameSession.state = "WAITING_FOR_BET";
      createGameSession(gameSession.balance);
      return res.status(200).json({
        message: "Next round started",
      });
    default:
      console.log("Guest access granted.");
  }
};
