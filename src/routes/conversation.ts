import express from "express";
import { Conversation } from "../database/models/Conversation.model.js";
import { Room } from "../database/models/Room.model.js";
import { Message } from "../database/models/Message.model.js";
import { User } from "../database/models/User.model.js";
import { attribute } from "@sequelize/core/_non-semver-use-at-your-own-risk_/expression-builders/attribute.js";

const router = express.Router();
router.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const conversation = await Conversation.findOne({
      where: { id },
      include: ["messages", "users"],
    });
    res.status(200).send({ conversation });
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

export default router;
