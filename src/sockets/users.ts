import { Op } from "@sequelize/core";
import { User } from "../database/models/User.model.js";
import { TUserSockets } from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";
import { Server } from "socket.io";

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
      const otherUsers = users
        .filter((user) => user?.id !== Number(userId))
        .map((user) => {
          return { ...user?.dataValues, type: "user" };
        });

      if (id === Number(userId)) {
        socket.emit("activeUsers", otherUsers);
      } else {
        socket.to(userSockets[userId]).emit("activeUsers", otherUsers);
      }
    });
    return users.map((user) => (user ? user.id : 0));
  }
};

export const sendUsers = async (io: Server, userSockets: TUserSockets) => {
  const userIds = Object.keys(userSockets).map((key) => Number(key));
  const unactiveUsers = await User.findAll({
    where: { id: { [Op.notIn]: userIds } },
  });
  const users = unactiveUsers.map((user) => {
    return { ...user?.dataValues, type: "user" };
  });
  io.emit("users", users);
};

export const connectUser = async (id: number) => {
  const user = await User.findByPk(id);
  if (user) {
    user.active = true;
    user.lastActive = new Date();
    await user.save();
  }
};

export const disconnectUser = async (id: number) => {
  const user = await User.findByPk(id);
  if (user) {
    user.active = false;
    user.lastActive = new Date();
    await user.save();
  }
};
