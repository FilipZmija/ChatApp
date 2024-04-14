import { Server as httpServer } from "http";
import { Server } from "socket.io";
import { validateTokenSocket } from "../auth/JWT.js";
import { User } from "../database/models/User.model.js";
import { CustomSocket } from "../types/local/socketIo.js";
import {
  IMessage,
  IConversation,
  IRoomCreationData,
  TUser,
  TUserSockets,
} from "../types/local/messaging.js";
import {
  MessageInstance,
  readMessageConfirmation,
  sendConfirmationMessage,
  sendMessage,
} from "./messages.js";
import { enterChat, leaveChat } from "./users.js";
import { askToJoinRoom, createRoom } from "./rooms.js";
import { startConversation } from "./conversations.js";
import { Conversation } from "../database/models/Conversation.model.js";
import { Message } from "../database/models/Message.model.js";

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
      const user = await enterChat(socket, id);
      const keys = Object.keys(this.users);
      const sendTo = keys
        .filter((key) => key !== id.toString())
        .map((key) => this.users[key])
        .flat();

      if (user) socket.to(sendTo).emit("user", user);
    }

    socket.on("disconnect", async () => {
      if (socket.user) {
        const userSockets = this.users[socket.user.id];
        const index = userSockets.indexOf(socket.id);
        userSockets.splice(index, 1);
        if (userSockets.length === 0) {
          delete this.users[socket.user.id];
        }
        setTimeout(async () => {
          if (socket.user && !this.users[socket.user.id]) {
            const user = await leaveChat(socket.user.id);
            if (user) socket.broadcast.emit("user", user);
          }
        }, 10000);
      }
    });

    socket.on(
      "readMessages",
      async ({
        conversationId,
        messageId,
      }: {
        conversationId: number;
        messageId: number;
      }) => {
        const conversation = await Conversation.findByPk(conversationId, {
          include: [{ model: Message, include: [User] }, User],
        });
        if (conversation)
          await readMessageConfirmation(
            socket,
            this.users,
            conversation,
            messageId
          );
      }
    );

    socket.on("createRoom", async (roomData: IRoomCreationData) => {
      if (socket.user) {
        const { name: name, id } = socket.user;
        const { name: roomName, users } = roomData;
        const room = await createRoom(roomData, id);
        if (room) {
          const conversation: IConversation = {
            id: room.conversationId,
            childId: room.id,
            type: "room",
            name: roomName,
          };
          const creationMessage: IMessage = {
            to: conversation,
            message: {
              type: "system",
              content: `${socket.user.name} created a group chat`,
              status: "sent",
            },
          };
          const user: TUser = { id, name: name };
          const message = new MessageInstance(creationMessage, user);
          await message.setRecipient(this.users, users);
          askToJoinRoom(message, conversation, socket);
        } else {
          socket.emit("error", {
            message: "Could not create a room, please try later",
          });
        }
      }
    });

    socket.on("joinRoom", async (childId) => {
      socket.join("room" + childId);
    });

    socket.on("sendMessage", async (recivedMessage: IMessage) => {
      if (socket.user) {
        const user: TUser = { id: socket.user.id, name: socket.user.name };
        const message = new MessageInstance(recivedMessage, user);
        if (!message.to?.id && message.to?.type === "user") {
          const recipient: IConversation = message.to;
          try {
            const conversationData = await startConversation(recipient, user);
            if (typeof conversationData !== "string") {
              message.updateRecipientsId(conversationData.conversation.id);
            } else {
              throw new Error(conversationData);
            }
          } catch (e) {
            console.error(e);
          }
        }
        const conversation = await message.setRecipient(this.users);
        const { status } = await message.saveMessage();
        if (conversation) {
          sendConfirmationMessage(message, conversation, socket, status);
        }
        sendMessage(message, socket);
      }
    });
  };
}
