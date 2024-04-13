import { Op } from "@sequelize/core";
import { User } from "../database/models/User.model.js";
import { TUserSockets } from "../types/local/messaging.js";
import { CustomSocket } from "../types/local/socketIo.js";
import { Server } from "socket.io";

export const sendActiveUsers = async (socket: CustomSocket) => {
  if (socket.user) {
    const { id } = socket.user;

    const users = await User.findAll({
      where: { active: true, id: { [Op.not]: id } },
    });
    socket.emit("activeUsers", users);
  }
};

export const sendUsers = async (socket: CustomSocket) => {
  if (socket.user) {
    const { id } = socket.user;
    const unactiveUsers = await User.findAll({
      where: { active: false, id: { [Op.not]: id } },
    });
    socket.emit("users", unactiveUsers);
  }
};

export const leaveChat = async (id: number) => {
  const user = await User.findByPk(id);
  if (user) {
    user.active = false;
    user.lastActive = new Date();
    await user.save();
  }
  return user;
};

export const enterChat = async (socket: CustomSocket, id: number) => {
  const user = await User.findByPk(id);
  if (user) {
    user.active = true;
    user.lastActive = new Date();
    await user.save();
    user.rooms?.forEach((room) => {
      socket.join("room" + room.id);
    });
  }
  return user;
};
