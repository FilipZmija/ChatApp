import { Op } from "@sequelize/core";
import { User } from "../database/models/User.model.js";
import { CustomSocket } from "../types/local/socketIo.js";
import { Room } from "../database/models/Room.model.js";

export const leaveChat = async (id: number) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (user) {
    user.active = false;
    user.lastActive = new Date();
    await user.save();
  }
  return user;
};

export const enterChat = async (socket: CustomSocket, id: number) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (user) {
    user.active = true;
    user.lastActive = new Date();
    await user.save();

    const rooms = await user.getRooms();
    if (rooms) {
      rooms.forEach((room) => {
        socket.join("room" + room.id);
      });
    }
  }
  return user;
};
