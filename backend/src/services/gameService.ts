import { games } from "../stores/gameStore";
import { GameSession, GameSessionResponse } from "../types/game";
import { calculateScore, createDeck } from "../utils/game";

export const toGameSessionResponse = (
  gameSession: GameSession,
): GameSessionResponse => {
  const { dealerHand, deck, ...response } = gameSession;
  return response;
};

export const createGameSession = (initalBalance: number): GameSession => {
  const gameSession: GameSession = {
    gameId: crypto.randomUUID(),
    state: "WAITING_FOR_CUT",
    playerHand: [],
    dealerHandVisible: [],
    playerScore: 0, //
    dealerScore: null, // Hidden until ROUND_END
    balance: initalBalance,
    winner: null,

    dealerHand: [],
    deck: createDeck(),
    playerBet: 0,
  };

  games.set(gameSession.gameId, gameSession);

  return gameSession;
};

export const resetGameSession = (gameId: string): GameSession | undefined => {
  const gameSession = games.get(gameId);
  if (gameSession) {
    gameSession.state = "WAITING_FOR_CUT";
    gameSession.playerHand = [];
    gameSession.dealerHandVisible = [];
    gameSession.playerScore = 0;
    gameSession.dealerScore = null;
    gameSession.winner = null;

    gameSession.dealerHand = [];
    gameSession.deck = createDeck();
  }
  return gameSession;
};

export const getGameSessionById = (gameId: string): GameSession | undefined => {
  return games.get(gameId);
};

export const dealerPlayTurn = (gameSession: GameSession): void => {
  if (calculateScore(gameSession.dealerHand) < 4) {
    const drawnCard = gameSession.deck.pop();
    if (drawnCard) {
      gameSession.dealerHand.push(drawnCard);
    }
  }
};
