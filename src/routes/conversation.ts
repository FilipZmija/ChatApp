import express from "express";
import { Conversation } from "../database/models/Conversation.model.js";
import { validateTokenApi } from "../auth/JWT.js";
import { User } from "../database/models/User.model.js";
import { Response, Request } from "express";
import {
  ConversationCard,
  findConvesationByTwoUsers,
} from "../sockets/conversations.js";
import Sequelize, { Op } from "@sequelize/core";
import { Room } from "../database/models/Room.model.js";
import { Message } from "../database/models/Message.model.js";
import { UsersConversation } from "../database/models/UsersConversation.model.js";
import { sequelize } from "../database/init.js";

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

router.get(
  "/all",
  validateTokenApi,
  async (req: Request<{}, {}, {}, { page: string }>, res: Response) => {
    const { id } = req.user;
    const { page } = req.query;
    const limit = 15;
    const offset = (Number(page) - 1) * limit || 0;
    try {
      const user = await User.findByPk(id);
      const latestMessagesSubQuery = `(SELECT id FROM Messages AS m WHERE m.conversationId = "Conversation"."id" ORDER BY m.createdAt DESC LIMIT 1)`;

      const conversations = await user?.getConversations({
        where: { type: "user" },
        include: [
          {
            model: User,
            through: { attributes: [] },
            where: { id: { [Op.ne]: id } },
          },
          {
            model: Message,
            where: {
              id: Sequelize.literal(`(${latestMessagesSubQuery})`),
            },
            include: [{ model: User, attributes: { exclude: ["password"] } }],
          },
        ],
        limit,
        offset,
        order: [[Sequelize.literal(`(${latestMessagesSubQuery})`), "DESC"]],
      });

      if (conversations) {
        const sortedConversations = conversations.sort((a, b) => {
          return a.messages && b.messages
            ? b.messages[0].createdAt.getTime() -
                a.messages[0].createdAt.getTime()
            : 0;
        });
        const conversatiosnNote = sortedConversations.map(
          (conversation) => new ConversationCard(conversation)
        );
        res.status(200).send(conversatiosnNote);
      } else res.status(404).send({ message: "No conversations found" });
    } catch (err) {
      console.log(err);
      res.status(404).send({ err });
    }
  }
);

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
