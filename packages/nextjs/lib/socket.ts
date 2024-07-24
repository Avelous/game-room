import Ably from "ably";

export const ablyRealtime = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
