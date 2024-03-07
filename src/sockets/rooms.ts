import { attribute } from "@sequelize/core/_non-semver-use-at-your-own-risk_/expression-builders/attribute.js";
import { Room } from "../database/models/Room.model.js";
import { ISucessError } from "../types/local/Info.js";
import { IRoomCreationData } from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";
import { MessageInstance } from "./messages.js";
import { Conversation } from "../database/models/Conversation.model.js";

export const askToJoinRoom = (
  message: MessageInstance,
  socket: CustomSocket
) => {
  if (typeof message.sendTo !== "undefined") {
    socket.to(message.sendTo).emit("joinRoom", message.messageBody);
  }
};

export const createRoom = async (
  roomData: IRoomCreationData,
  userId: number
) => {
  const { name: roomName, users } = roomData;
  try {
    const conversation = await Conversation.create({ type: "room" });
    const room = await Room.create({
      name: roomName,
      conversationId: conversation.id,
    });
    await room.addUsers([userId, ...users]);
    return room;
  } catch (err) {
    console.log(err);
  }
};
