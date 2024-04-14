import express from "express";
import { Response, Request } from "express";
import { validateTokenApi, createToken } from "../auth/JWT.js";
import { Conversation } from "../database/models/Conversation.model.js";
import { attribute } from "@sequelize/core/_non-semver-use-at-your-own-risk_/expression-builders/attribute.js";
import { User } from "../database/models/User.model.js";
const router = express.Router();

router.use(express.json({ limit: "10mb" }));
router.use((req, res, next) => {
  next();
});

router.get(
  "/:id",
  validateTokenApi,
  async (
    req: Request<{ id: string }, {}, {}, { page: string }>,
    res: Response
  ) => {
    const { id } = req.params;
    const limit = 30;
    const { page } = req.query;
    const offset = (Number(page) - 1) * limit || 0;
    try {
      const conversation = await Conversation.findByPk(id);

      if (!conversation) res.status(404).send({ err: "No conversation found" });
      const messages = await conversation?.getMessages({
        limit: limit,
        offset: offset,
        include: [{ model: User, attributes: { exclude: ["password"] } }],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).send({ messages: messages?.reverse() });
    } catch (err) {
      res.status(400).send({ err });
    }
  }
);

export default router;
