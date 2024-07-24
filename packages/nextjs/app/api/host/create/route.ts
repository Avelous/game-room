import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import Invites from "~~/lib/models/Invites";

const JWT_SECRET = process.env.JWT_SECRET || "superhardstring";

async function generateUniqueInvite(length: number) {
  let invites = await Invites.findOne();

  if (!invites) {
    const newInvites = new Invites({
      codes: [],
    });
    invites = await newInvites.save();
  }

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let invite = "";
  const existingCodes = invites?.codes || [];

  while (true) {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      invite += characters.charAt(randomIndex);
    }

    if (!existingCodes.includes(invite)) {
      existingCodes.push(invite);
      await Invites.findByIdAndUpdate(invites?.id, {
        codes: existingCodes,
      });
      return invite;
    }

    invite = "";
  }
}

export const GET = async () => {
  try {
    await connectdb();
    const games = await Game.find();
    return new NextResponse(JSON.stringify(games), { status: 200 });
  } catch (error) {
    return new NextResponse("Error fetching game" + error, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { hostAddress } = body;

    await connectdb();
    const newGame = new Game({
      hostAddress,
      status: "ongoing",
      inviteCode: await generateUniqueInvite(8),
    });

    await newGame.save();

    let token;

    if (JWT_SECRET) token = jwt.sign({ address: hostAddress }, JWT_SECRET);

    return new NextResponse(JSON.stringify({ message: "New game created", token, game: newGame }), { status: 201 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error creating Game",
        error,
      }),
      {
        status: 500,
      },
    );
  }
};
