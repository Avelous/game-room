import { saveGameState } from "../game";

export const joinGame = async (invite: string, address: string) => {
  const response = await fetch("/api/player/join", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inviteCode: invite, playerAddress: address }),
  });

  const updatedGame = await response.json();
  saveGameState(JSON.stringify(updatedGame));
};
