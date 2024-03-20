import express from "express";
import { Conversation } from "../database/models/Conversation.model.js";
import { validateTokenApi } from "../auth/JWT.js";
import { User } from "../database/models/User.model.js";
import {
  ConversationNote,
  findConvesationByTwoUsers,
} from "../sockets/conversations.js";
import { Op } from "@sequelize/core";
import { Room } from "../database/models/Room.model.js";
import { Message } from "../database/models/Message.model.js";
import { UsersConversation } from "../database/models/UsersConversation.model.js";

const router = express.Router();
router.get("/user/:id", validateTokenApi, async (req, res) => {
  const ids: number[] = [];
  ids.push(Number(req.params.id));
  ids.push(req.user.id);
  console.log(ids);
  try {
    const conversation = await findConvesationByTwoUsers(ids);
    res.status(200).send(conversation);
  } catch (err) {
    console.log(err);
    res.status(404).send({ err });
  }
});

router.get("/all", validateTokenApi, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findByPk(id);
    const conversations = await user?.getConversations({
      include: [
        { model: Message },
        { model: Room },
        { model: User, where: { id: { [Op.ne]: id } } },
      ],
      order: [[Message, "createdAt", "DESC"]],
    });

    if (conversations) {
      const conversatiosnNote = conversations.map(
        (conversation) => new ConversationNote(conversation)
      );
      res.status(200).send(conversatiosnNote);
    }
  } catch (err) {
    console.log(err);
    res.status(404).send({ err });
  }
});

router.get("/room/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const room = await Room.findByPk(id);
    const conversation = await room?.getConversation({
      include: [
        { model: Message },
        { model: User, attributes: { exclude: ["password"] } },
      ],
    });
    res.status(200).send({ conversation, recipient: room });
  } catch (err) {
    console.log(err);
    res.status(404).send({ err });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const conversation = await Conversation.findOne({
      where: { id },
      include: [
        {
          association: "room",
          include: [
            { association: "users", attributes: { exclude: ["password"] } },
          ],
        },
        {
          association: "messages",
        },
      ],
    });
    res.status(200).send({ conversation });
  } catch (err) {
    console.log(err);
    res.status(404).send({ err });
  }
});

export default router;
