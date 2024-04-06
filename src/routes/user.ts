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
    const accessToken = createToken(user);
    res.json({
      message: "User logged in successfully",
      accessToken: accessToken,
      name: user.name,
      id: user.id,
    });
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

router.get("/all", validateTokenApi, async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { id: { [Op.ne]: req.user.id } },
      attributes: { exclude: ["password"] },
    });
    if (users) {
      res.status(200).json({ users });
    } else {
      res.status(404).json({ message: "No users exist" });
    }
  } catch (e) {
    res.status(400).json({ e });
  }
});

router.get(
  "/search",
  validateTokenApi,
  async (req: Request<{}, {}, {}, { name: string }>, res: Response) => {
    const { name }: { name: string } = req.query;
    console.log(name);
    try {
      const users = name
        ? await User.findAll({
            where: {
              name: { [Op.substring]: name },
              id: { [Op.ne]: req.user.id },
            },
            attributes: { exclude: ["password"] },
          })
        : await User.findAll({
            where: {
              id: { [Op.ne]: req.user.id },
            },
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
