import { Conversation } from "../database/models/Conversation.model.js";
import {
  TMessage,
  TUser,
  TConversation,
  TUserSockets,
} from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";

export class Message {
  to: TConversation;
  message: { type: "message" | "system"; content: string };
  sendTo: string | string[] | undefined;
  from: TUser;

  constructor(message: TMessage, user: TUser) {
    this.to = message.to;
    this.message = message.message;
    this.sendTo = undefined;
    this.from = user;
  }

  async setRecipient(recipients: TUserSockets, users?: number[]) {
    const { type, id } = this.to;
    if (type === "room" && typeof users === "undefined") {
      this.sendTo = "room" + id;
    } else if (type === "user" && typeof users === "undefined") {
      const conversation = await Conversation.findByPk(id);
      if (conversation) {
        const users = await conversation.getUsers();
        const ids = users.map((user) => user.id);
        this.sendTo = ids.map((id) => recipients[id]).flat();
      }
    } else if (typeof users !== "undefined") {
      this.sendTo = users.map((id) => recipients[id]).flat();
    }
  }

  get messageBody() {
    return {
      to: this.to,
      from: this.from,
      message: this.message,
    };
  }
}

export const sendMessage = (message: Message, socket: CustomSocket) => {
  const eventName = message.to.type + message.from.id;
  if (typeof message.sendTo !== "undefined") {
    socket.to(message.sendTo).emit("message", message.messageBody);
    socket.to(message.sendTo).emit(eventName, message.messageBody);
  }
};

export const askToJoinRoom = (message: Message, socket: CustomSocket) => {
  if (typeof message.sendTo !== "undefined") {
    socket.to(message.sendTo).emit("joinRoom", message.messageBody);
  }
};

export const startConversation = async (message: Message) => {
  const { id, type } = message.to;
  const { id: senderId } = message.from;
  try {
    if (type === "user") {
      const conversation = await Conversation.create();
      conversation.setUsers([id, senderId]);
    }
  } catch (e) {
    console.error(e);
  }
};
