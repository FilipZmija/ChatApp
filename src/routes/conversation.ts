import express from "express";
import { Conversation } from "../database/models/Conversation.model.js";
import { validateTokenApi } from "../auth/JWT.js";
import { User } from "../database/models/User.model.js";
import {
  ConversationNote,
  findConvesationByTwoUsers,
} from "../sockets/conversations.js";

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
      include: [{ model: User }],
    });
    const conversatiosnNote = conversations?.map(
      (conversation) => new ConversationNote(conversation)
    );
    res.status(200).send(conversatiosnNote);
  } catch (err) {
    console.log(err);
    res.status(404).send({ err });
  }
});

router.get("/room/:id", async (req, res) => {
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
