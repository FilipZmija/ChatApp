import { Socket } from "socket.io";
import { TUser } from "./messaging.js";

export interface CustomSocket extends Socket {
  user?: TUser;
}
