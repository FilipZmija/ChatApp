export interface TUserSockets {
  [id: string]: string[];
}

export interface IConversation {
  id: number | null;
  childId: number;
  type: "room" | "user";
  name?: string;
}

export interface TUser {
  id: number;
  name: string;
}

export interface IMessage {
  to: IConversation;
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
