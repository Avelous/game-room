import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";

const JWT_SECRET = process.env.JWT_SECRET || "superhardstring";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { inviteCode, playerAddress } = body;
    const game = await Game.findOne({ inviteCode });

    if (!game) {
      return new NextResponse(JSON.stringify({ message: "Game not found" }), { status: 201 });
    }

    if (game.players.includes(playerAddress)) {
      return new NextResponse(JSON.stringify({ message: "Player already joined" }), { status: 403 });
    }

    let token;

    if (JWT_SECRET) token = jwt.sign({ address: playerAddress }, JWT_SECRET);

    game.players.push(playerAddress);
    const savedGame = await game.save();

    const channel = ablyRealtime.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, savedGame);
    return new NextResponse(JSON.stringify({ message: "Joined game Successfully", token, game: savedGame }), {
      status: 200,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error joining Game",
        error,
      }),
      {
        status: 500,
      },
    );
  }
};
