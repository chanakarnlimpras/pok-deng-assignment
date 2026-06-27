import { CARD_VALUES } from "../constants/card";
import { Card, Suit, Rank, GameSession } from "./../types/game";

export const calculateScore = (cards: Card[]): number => {
  const sum = cards.reduce((score, card) => score + card.value, 0);
  return sum % 10;
};

export const createDeck = (): Card[] => {
  const deck = [] as Card[];
  for (const suit of ["Hearts", "Diamonds", "Clubs", "Spades"] as Suit[]) {
    for (const rank of [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ] as Rank[]) {
      deck.push({
        rank,
        suit,
        value: CARD_VALUES[rank],
      });
    }
  }

  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const cutDeck = (deck: Card[], amount: number): Card[] => {
  const top = deck.splice(0, amount);
  deck.push(...top);
  return deck;
};

export const dealCards = (gameSession: GameSession, count: number) => {
  for (let i = 0; i < count; i++) {
    if (gameSession.deck.length === 0) {
      throw new Error("Deck is empty");
    }
    const playerCard = gameSession.deck.pop();
    if (playerCard) {
      gameSession.playerHand.push(playerCard);
    }
    const dealerCard = gameSession.deck.pop();
    if (dealerCard) {
      gameSession.dealerHand.push(dealerCard);
    }
  }
  return ;
};

export const drawCard = (deck: Card[]): Card => {
  if (deck.length === 0) {
    throw new Error("Deck is empty");
  }
  return deck.pop() as Card;
};
