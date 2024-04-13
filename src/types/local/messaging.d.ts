import { Message } from "../../database/models/Message.model.ts";

export interface TUserSockets {
  [id: string]: string[];
}

export interface IConversation {
  id: number | null;
  childId: number;
  type: "room" | "user";
  name?: string;
  lastMessage?: Message;
}

export interface TUser {
  id: number;
  name: string;
}

export interface IMessage {
  to: IConversation;
  message: {
    type: "message" | "system";
    content: string;
    status: "sent" | "delivered" | "read";
  };
}

export interface IRoomCreationData {
  name: string;
  users: number[];
}
