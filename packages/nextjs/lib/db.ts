import { ablyRealtime } from "./socket";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

const connectdb = async () => {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("Already connected");
    return;
  }

  if (connectionState === 2) {
    console.log("Connecting...");
    return;
  }

  try {
    await ablyRealtime.connection.once("connected");
    ablyRealtime.channels.get(`gameUpdate`);
    await mongoose.connect(MONGODB_URI, {
      dbName: "scribblepics",
      bufferCommands: false,
    });
    console.log("Connected");
  } catch (error) {
    console.log("Error in connecting to database", error);
    throw new Error("Error connecting to database");
  }
};

export default connectdb;
