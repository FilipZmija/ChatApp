import express from "express";
import { Room } from "../database/models/Room.model.js";
import { validateTokenApi } from "../auth/JWT.js";
import { User } from "../database/models/User.model.js";
const router = express.Router();

router.get("/:roomId", validateTokenApi, async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findOne({
      where: { id: roomId },
      include: [
        {
          model: User,
          required: true,
          attributes: { exclude: ["password"] },
        },
      ],
    });
    res.status(200).json({ room });
  } catch (err) {
    console.error(err);
    res.status(400).json({ err });
  }
});

router.get("/user/all", validateTokenApi, async (req, res) => {
  const { id } = req.user;
  try {
    const room = await User.findAll({
      where: { id },
      include: [
        {
          model: Room,
          required: true,
          attributes: { exclude: ["password"] },
        },
      ],
    });
    res.status(200).json({ room });
  } catch (err) {
    console.error(err);
    res.status(400).json({ err });
  }
});

router.post("/create", validateTokenApi, async (req, res) => {
  const { id } = req.user;
  try {
    const name: string = req.body.name;
    const room = await Room.create({ name: name, type: "room" });
    await room.addUser(id);
    res.status(200).json({ room });
  } catch (err) {
    console.error(err);
    res.status(400).json({ err });
  }
});

router.post("/join/:roomId", validateTokenApi, async (req, res) => {
  const { id } = req.user;
  const { roomId } = req.params;
  try {
    const room = await Room.findOne({ where: { id: roomId } });
    if (room) {
      await room.addUser(id);
      res.status(200).json({ room });
    } else {
      res.status(404).json({ message: "No such a room." });
    }
  } catch (err) {
    res.status(400).json({ err });
  }
});

router.post("/asign/:roomId", validateTokenApi, async (req, res) => {
  const { roomId } = req.params;
  const userIds: number[] = req.body.userIds;
  console.log(userIds);
  try {
    const room = await Room.findOne({ where: { id: roomId } });
    if (room) {
      await room.addUsers(userIds);
      res.status(200).json({ room });
    } else {
      res.status(404).json({ message: "No such a room." });
    }
  } catch (err) {
    res.status(400).json({ err });
    console.error(err);
  }
});

export default router;
