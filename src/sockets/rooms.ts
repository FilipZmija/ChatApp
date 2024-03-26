import { Room } from "../database/models/Room.model.js";
import { IConversation, IRoomCreationData } from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";
import { MessageInstance } from "./messages.js";
import { Conversation } from "../database/models/Conversation.model.js";

export const askToJoinRoom = (
  message: MessageInstance,
  conversation: IConversation,
  socket: CustomSocket
) => {
  console.log("this", message.sendTo);
  message.saveMessage();
  if (message.sendTo) {
    socket.to(message.sendTo).emit("joinRoom", conversation);
    socket.emit("joinRoom", conversation);
    socket.to("room" + message.to.childId).emit("joinRoom", conversation);
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
    await conversation.addUsers([userId, ...users]);
    return room;
  } catch (err) {
    console.log(err);
  }
};
