import { Server as httpServer } from "http";
import { Server } from "socket.io";
import { validateTokenSocket } from "../auth/JWT.js";
import { User } from "../database/models/User.model.js";
import { CustomSocket } from "../types/local/socketIo.js";
import {
  IRecipeint,
  IRoom,
  IRoomCreationData,
  TConversation,
  TMessage,
  TUser,
  TUserSockets,
} from "../types/local/messaging.js";
import { MessageInstance, sendMessage, startConversation } from "./messages.js";
import { Room } from "../database/models/Room.model.js";
import { sendActiveUsers } from "./users.js";
import { Conversation } from "../database/models/Conversation.model.js";
import { askToJoinRoom, createRoom } from "./rooms.js";

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

    socket.on("disconnect", async () => {
      if (socket.user) {
        const userSockets = this.users[socket.user.id];
        const index = userSockets.indexOf(socket.id);
        userSockets.splice(index, 1);
        if (userSockets.length === 0) {
          delete this.users[socket.user.id];
        }
        setTimeout(() => {
          userSockets.length === 0 && sendActiveUsers(this.users, socket);
        }, 20000);
      }
    });

    socket.on("getUsers", () => {
      sendActiveUsers(this.users, socket);
    });

    socket.on("createRoom", async (roomData: IRoomCreationData) => {
      if (socket.user) {
        const { name: userName, id } = socket.user;
        const { name: roomName, users } = roomData;
        const room = await createRoom(roomData, id);
        if (room) {
          const conversation: IRoom = {
            id: room.conversationId,
            roomId: room.id,
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
          const user: TUser = { id, name: userName };
          const message = new MessageInstance(creationMessage, user);
          message.setRecipient(this.users, users);
          askToJoinRoom(message, socket);
        } else {
          socket.emit("error", {
            message: "Could not create a room, please try later",
          });
        }
      }
    });

    socket.on("joinRoom", async (data) => {
      socket.join("room" + data.id);
    });

    socket.on("sendMessage", async (recivedMessage: TMessage) => {
      if (socket.user) {
        const user: TUser = { id: socket.user.id, name: socket.user.name };
        const message = new MessageInstance(recivedMessage, user);
        if (!recivedMessage.to.id && message.to.type === "user") {
          const recipient: IRecipeint = message.to;
          try {
            const conversation = await startConversation(recipient, user);
            if (typeof conversation !== "string") {
              message.updateRecipientsId(conversation.id);
            } else {
              throw new Error(conversation);
            }
          } catch (e) {
            console.error(e);
          }
        }
        await message.setRecipient(this.users);
        await message.saveMessage();
        sendMessage(message, socket);
      }
    });
  };
}
