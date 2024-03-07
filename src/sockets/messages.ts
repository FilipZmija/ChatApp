import { literal } from "@sequelize/core";
import { Conversation } from "../database/models/Conversation.model.js";
import { User } from "../database/models/User.model.js";
import {
  TMessage,
  TUser,
  TUserSockets,
  IRecipeint,
  IRoom,
  ISimpleMessage,
} from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";
import { Message } from "../database/models/Message.model.js";
import { ISucessError } from "../types/local/Info.js";

export class MessageInstance {
  to: IRecipeint | IRoom;
  message: { type: "message" | "system"; content: string };
  sendTo: string | string[] | undefined;
  from: TUser;

  constructor(message: TMessage, user: TUser) {
    this.to = message.to;
    this.message = message.message;
    this.sendTo = undefined;
    this.from = user;
  }

  updateRecipientsId(id: number) {
    this.to.id = id;
  }

  async setRecipient(
    recipients: TUserSockets,
    users?: number[] | Conversation
  ) {
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
    } else if (Array.isArray(users)) {
      this.sendTo = users.map((id) => recipients[id]).flat();
    }
  }

  async saveMessage(): Promise<ISucessError> {
    const { id: userId } = this.from;
    const { id: conversationId } = this.to;
    const { content } = this.message;
    if (conversationId) {
      try {
        await Message.create({
          userId,
          conversationId,
          content,
        });
        return { status: true, message: "Message saved successfully" };
      } catch (e) {
        console.error(e);
        return { status: false, message: "Couldn't add message to DB." };
      }
    } else {
      return { status: false, message: "No conversation id" };
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

export const sendMessage = (message: MessageInstance, socket: CustomSocket) => {
  const eventName = message.to.type + message.from.id;
  if (typeof message.sendTo !== "undefined") {
    socket.to(message.sendTo).emit("message", message.messageBody);
    socket.to(message.sendTo).emit(eventName, message.messageBody);
  }
};

export const startConversation = async (
  recipeint: IRecipeint,
  user: TUser
): Promise<Conversation | string> => {
  const { type, userId } = recipeint;
  const { id } = user;
  try {
    const user = await User.findByPk(id);
    if (user) {
      const existingConvsation = await user.getConversations({
        where: {
          "$users.id$": userId,
        },
        include: ["users"],
      });
      console.log(existingConvsation[0].id);
      if (existingConvsation[0]) return existingConvsation[0];
    }
    const conversation = await Conversation.create({ type });
    if (userId) {
      await conversation.setUsers([id, userId]);
      return conversation;
    } else return "Something went wrong";
  } catch (e) {
    console.error(e);
    return "Something went wrong";
  }
};
