export interface TUserSockets {
  [id: string]: string[];
}

export interface TConversation {
  id: number | null;
}

export interface IRecipeint extends TConversation {
  userId: number;
  type: "user";
}

export interface IRoom extends TConversation {
  name: string;
  type: "room";
  roomId: number;
}

export interface TUser {
  id: number;
  name: string;
}

export interface TMessage {
  to: IRecipeint | IRoom;
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
