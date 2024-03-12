export interface TUserSockets {
  [id: string]: string[];
}

export interface IConversationRecipeint {
  id: number | null;
  userId: number;
  type: "user";
}

export interface IConversationRoom {
  id: number | null;
  name: string;
  roomId: number;
  type: "room";
}

export interface TUser {
  id: number;
  name: string;
}

export interface IMessage {
  to: IConversationRecipeint | IConversationRoom;
  message: { type: "message" | "system"; content: string };
}

export interface ISimpleMessage {
  type: "message" | "system";
  content: string;
  id: number;
}

export interface IRoomCreationData {
  name: string;
  users: number[];
}
