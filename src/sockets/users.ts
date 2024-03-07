import { User } from "../database/models/User.model.js";
import { TUserSockets } from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";

export const sendActiveUsers = async (
  userSockets: TUserSockets,
  socket: CustomSocket
) => {
  if (socket.user) {
    const { id } = socket.user;
    const users = await Promise.all(
      Object.keys(userSockets).map((key) => User.findByPk(key))
    );
    Object.keys(userSockets).forEach(async (userId) => {
      const otherUsers = users.filter((user) => user?.id !== Number(userId));
      if (id === Number(userId)) {
        socket.emit("users", otherUsers);
      } else {
        socket.to(userSockets[userId]).emit("users", otherUsers);
      }
    });
  }
};
