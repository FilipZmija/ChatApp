import { Server as httpServer } from "http";
import { Server } from "socket.io";
import { validateTokenSocket } from "../auth/JWT.js";
import { User } from "../database/models/User.model.js";
import { CustomSocket } from "../types/local/socketIo.js";
import {
  TConversation,
  TMessage,
  TRoom,
  TUser,
  TUserSockets,
} from "../types/local/messaging.js";
import {
  Message,
  askToJoinRoom,
  sendMessage,
  startConversation,
} from "./messages.js";
import { Room } from "../database/models/Room.model.js";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;
  public users: TUserSockets;

  constructor(server: httpServer) {
    ServerSocket.instance = this;
    this.users = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 5000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.CLIENT_URI
            : ["http://localhost:3000"],
      },
    });

    this.io
      .use((socket, next) => {
        validateTokenSocket(socket, next);
      })
      .on("connection", this.startListeners);
  }

  private startListeners = async (socket: CustomSocket) => {
    if (socket.user) {
      const { id }: { id: number } = socket.user;

      this.users[id]
        ? this.users[id].push(socket.id)
        : (this.users[id] = [socket.id]);

      const user = await User.findOne({
        where: { id },
        include: [{ model: Room, required: true }],
      });
      if (user) {
        user.rooms?.forEach((room) => {
          socket.join("room" + room.id);
        });
      }
    }

    socket.on("disconnect", () => {
      if (socket.user) {
        const userSockets = this.users[socket.user.id];
        const index = userSockets.indexOf(socket.id);
        userSockets.splice(index, 1);
      }
    });

    socket.on("message", () => {
      socket.emit("users", this.users);
    });

    socket.on("createRoom", async (roomData: TRoom) => {
      if (socket.user) {
        const { name: roomName, users } = roomData;
        const { name: userName, id } = socket.user;
        const user: TUser = { id, name: userName };
        const room = await Room.create({ name: roomName });
        await room.addUsers([id, ...users]);

        const conversation: TConversation = {
          id: room.id,
          type: "room",
          name: roomName,
        };
        const creationMessage: TMessage = {
          to: conversation,
          message: {
            type: "system",
            content: `${socket.user.name} created a group chat`,
          },
        };
        const message = new Message(creationMessage, user);

        message.setRecipient(this.users, users);
        askToJoinRoom(message, socket);
      }
    });

    socket.on("joinRoom", async (data) => {
      socket.join("room" + data.id);
    });

    socket.on("sendMessage", async (recivedMessage: TMessage) => {
      if (socket.user) {
        const user: TUser = { id: socket.user.id, name: socket.user.name };
        const message = new Message(recivedMessage, user);
        await message.setRecipient(this.users);
        sendMessage(message, socket);
      }
    });
  };
}
