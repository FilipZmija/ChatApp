export interface TUserSockets {
  [id: number]: string[];
}

export interface TConversation {
  id: number;
  type: "user" | "room";
  name?: string;
}

export interface TUser {
  id: number;
  name: string;
}

export interface TMessage {
  to: TConversation;
  message: { type: "message" | "system"; content: string };
}

export interface TRoom {
  name: string;
  users: number[];
}
