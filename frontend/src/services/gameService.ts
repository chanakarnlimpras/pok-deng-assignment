import api from "./api";

export const createGame = async (initialBalance: number) => {
  const response = await api.post("/game/create", {
    initialBalance: initialBalance,
  });
  return response.data;
};


export const performAction = async (
  gameId: string,
  action: string,
  amount?: number,
) => {
  const response = await api.post(`game/${gameId}/action`, {
    action: action,
    amount: amount,
  });
  return response.data;
};
