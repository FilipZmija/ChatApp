import { Conversation } from "../database/models/Conversation.model.js";
import {
  IMessage,
  TUser,
  TUserSockets,
  IConversation,
} from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";
import { Message } from "../database/models/Message.model.js";
import { ISucessError } from "../types/local/Info.js";
import { User } from "../database/models/User.model.js";
import { Op } from "@sequelize/core";
import { ConversationCard } from "./conversations.js";
import { Room } from "../database/models/Room.model.js";

export class MessageInstance {
  to: IConversation;
  message: {
    type: "message" | "system";
    content: string;
    status: "sent" | "delivered" | "read" | "failed to deliver";
    id?: number;
  };
  sendTo: string | string[] | undefined;
  from: TUser;

  constructor(message: IMessage, user: TUser) {
    this.to = message.to;
    this.message = message.message;
    this.sendTo = undefined;
    this.from = user;
    this.message.status = "sent";
  }
  updateRecipientsId(id: number) {
    this.to.id = id;
  }

  async setRecipient(
    recipients: TUserSockets,
    users?: number[] | Conversation
  ) {
    const { type, childId, id } = this.to;
    const conversation = await Conversation.findByPk(id, {
      include: [
        { model: User, where: { [Op.not]: { id: this.from.id } } },
        { model: Room },
      ],
    });

    const conversationCard = conversation
      ? new ConversationCard(conversation)
      : null;
    if (type === "room" && typeof users === "undefined") {
      this.sendTo = "room" + childId;
    } else if (type === "user" && typeof users === "undefined") {
      if (conversation) {
        const users = await conversation.getUsers();
        const ids = users.map((user) => user.id);
        this.sendTo = ids.map((id) => recipients[id]).flat();
      }
    } else if (Array.isArray(users)) {
      this.sendTo = users.map((id) => recipients[id]).flat();
      console.log(this.sendTo);
    }
    return conversationCard;
  }

  async saveMessage(): Promise<ISucessError> {
    const { id: userId } = this.from;
    const { id: conversationId } = this.to;
    const { content } = this.message;
    if (conversationId) {
      try {
        const savedMessage = await Message.create({
          userId,
          conversationId,
          content,
          status: "delivered",
        });
        this.message.id = savedMessage.id;
        this.message.status = "delivered";
        return { status: true, message: "Message saved successfully" };
      } catch (e) {
        console.error(e);
        this.message.status = "failed to deliver";
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
  let eventName = message.to.type;
  if (message.to.type === "user") {
    eventName += message.from.id;
  } else {
    eventName += message.to.childId;
  }
  if (typeof message.sendTo !== "undefined") {
    socket.to(message.sendTo).emit("message", message.messageBody);
    socket.to(message.sendTo).emit(eventName, message.messageBody);
  }
};

export const sendConfirmationMessage = (
  message: MessageInstance,
  conversation: ConversationCard,
  socket: CustomSocket,
  status: boolean
) => {
  if (status) {
    const eventName = "confirmation" + message.to.type + message.to.childId;
    socket.emit(eventName, { message: message.messageBody, conversation });
  } else {
    socket.emit("error", { message: "Couldn't send message" });
  }
};
