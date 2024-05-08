import express from "express";
import bcrypt from "bcrypt";
import { User } from "../database/models/User.model.js";
import { Response, Request } from "express";
import { validateTokenApi, createToken } from "../auth/JWT.js";
import { Op } from "@sequelize/core";
const router = express.Router();

router.use(express.json({ limit: "10mb" }));
router.use((req, res, next) => {
  next();
});

router.post("/register", async (req, res) => {
  const { name, password }: { name: string; password: string } = req.body;
  try {
    const user = await User.findOne({ where: { name } });
    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      await User.create({
        name,
        password: hash,
        active: false,
        type: "user",
        lastActive: new Date(),
      });
      res.status(200).json({ message: "You have registered succesfully" });
    } else {
      res.status(400).json({ message: "User with this name already exists" });
    }
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: "User has not been registered", e });
  }
});

router.post("/login", async (req, res) => {
  const { name, password }: { name: string; password: string } = req.body;
  try {
    const user = await User.findOne({ where: { name: name } });
    if (!user) return res.status(404).json({ message: "User does not exist" });
    const hashPassword = await bcrypt.compare(password, user.password);
    if (!hashPassword)
      return res.status(400).json({ message: "Invalid password" });
    else {
      const accessToken = createToken(user);
      res.status(200).json({
        message: "User logged in successfully",
        accessToken: accessToken,
        name: user.name,
        id: user.id,
      });
    }
  } catch (e) {
    console.error(e);
    res
      .status(404)
      .json({ message: "Something went wrong, please try again", e });
  }
});

router.get("/data", validateTokenApi, async (req: Request, res: Response) => {
  const { id }: { id: number } = req.user;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ message: "User does not exist" });
    }
  } catch (e) {
    res.status(400).json({ e });
  }
});

router.get(
  "/all",
  validateTokenApi,
  async (req: Request<{}, {}, {}, { page: string }>, res: Response) => {
    try {
      const { page }: { page: string } = req.query;
      const limit = 20;
      const offset = (Number(page) - 1) * limit || 0;
      const users = await User.findAll({
        where: { id: { [Op.ne]: req.user.id } },
        attributes: { exclude: ["password"] },
        limit,
        offset,
        order: [["lastActive", "DESC"]],
      });
      if (users) {
        res.status(200).json({ users });
      } else {
        res.status(404).json({ message: "No users exist" });
      }
    } catch (e) {
      res.status(400).json({ e });
    }
  }
);

router.get(
  "/all/active",
  validateTokenApi,
  async (req: Request<{}, {}, {}, { page: string }>, res: Response) => {
    const { page }: { page: string } = req.query;
    const limit = 10;
    const offset = (Number(page) - 1) * limit || 0;
    try {
      const usersActive = await User.findAll({
        where: { id: { [Op.ne]: req.user.id }, active: true },
        attributes: { exclude: ["password"] },
        offset,
        limit,
        order: [["lastActive", "DESC"]],
      });

      if (usersActive) {
        res.status(200).json({ usersActive });
      } else {
        res.status(404).json({ message: "No users exist" });
      }
    } catch (e) {
      res.status(400).json({ e });
    }
  }
);

router.get(
  "/all/unactive",
  validateTokenApi,
  async (req: Request<{}, {}, {}, { page: string }>, res: Response) => {
    const { page }: { page: string } = req.query;
    const limit = 10;
    const offset = (Number(page) - 1) * limit || 0;
    try {
      const usersUnactive = await User.findAll({
        where: { id: { [Op.ne]: req.user.id }, active: false },
        attributes: { exclude: ["password"] },
        offset,
        limit,
        order: [["lastActive", "DESC"]],
      });
      if (usersUnactive) {
        res.status(200).json({ usersUnactive });
      } else {
        res.status(404).json({ message: "No users exist" });
      }
    } catch (e) {
      res.status(400).json({ e });
    }
  }
);

router.get(
  "/search",
  validateTokenApi,
  async (
    req: Request<{}, {}, {}, { name: string; page: string }>,
    res: Response
  ) => {
    const { name }: { name: string } = req.query;
    const { page }: { page: string } = req.query;
    const limit = 15;
    const offset = (Number(page) - 1) * limit || 0;
    try {
      const users = await User.findAll({
        where: {
          name: { [Op.substring]: name },
          id: { [Op.ne]: req.user.id },
        },
        limit,
        offset,
        attributes: { exclude: ["password"] },
      });

      if (users) {
        res.status(200).json({ users });
      } else {
        res.status(404).json({ message: "No users found" });
      }
    } catch (e) {
      res.status(400).json({ e });
    }
  }
);

export default router;
