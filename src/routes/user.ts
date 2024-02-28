import express from "express";
import bcrypt from "bcrypt";
import { User } from "../database/models/User.model.js";
import { Response, Request } from "express";
import { validateTokenApi, createToken } from "../auth/JWT.js";
const router = express.Router();

router.use(express.json({ limit: "10mb" }));
router.use((req, res, next) => {
  next();
});

router.post("/register", async (req, res) => {
  const { username, password }: { username: string; password: string } =
    req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      await User.create({ username, password: hash });
      res.status(200).json({ message: "You have registered succesfully" });
    } else {
      res
        .status(400)
        .json({ message: "User with this username already exists" });
    }
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: "User has not been registered", e });
  }
});

router.post("/login", async (req, res) => {
  const { username, password }: { username: string; password: string } =
    req.body;
  try {
    const user = await User.findOne({ where: { username: username } });
    if (!user) return res.status(404).json({ message: "User does not exist" });
    const hashPassword = await bcrypt.compare(password, user.password);
    if (!hashPassword)
      return res.status(400).json({ message: "Invalid password" });
    const accessToken = createToken(user);
    res.json({
      message: "User logged in successfully",
      accessToken: accessToken,
      username: user.username,
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

export default router;
