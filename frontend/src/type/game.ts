export type GameState =
  | "WAITING_FOR_CUT"
  | "WAITING_FOR_BET"
  | "WAITING_FOR_DECISION"
  | "DEALER_TURN"
  | "ROUND_END";

export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";
export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type Winner = "Player" | "Dealer" | "Tie" | null;

export interface Card {
  rank: Rank;
  suit: Suit;
  value: number;
}

export interface GameSession {
  gameId: string;
  state: GameState;
  balance: number;
  playerHand: Card[];
  dealerHandVisible: Card[]; // Hidden until ROUND_END
  playerScore: number | null; //
  dealerScore: number | null; // Hidden until ROUND_END
  winner: Winner;

  dealerHand: Card[];
  deck: Card[];
  playerBet: number;

  prize?: number;
}

export type GameSessionResponse = Omit<GameSession, "dealerHand" | "deck">;

export interface CreateGameRequest {
  initialBalance: number;
}
export type Action = "CUT" | "BET" | "DRAW" | "STAY" | "NEXT_ROUND";
export interface PerformActionRequest {
  action: Action;
  amount?: number;
}
