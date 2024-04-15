import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { User } from "../database/models/User.model.js";

export const initUsers = async (usersCount: number) => {
  const hash = await bcrypt.hash("test", 10);
  await User.create({
    name: "test",
    password: hash,
    type: "user",
    lastActive: new Date(),
    active: false,
  });
  for (let i = 0; i <= usersCount; i++) {
    const name = faker.internet.userName();
    const hash = await bcrypt.hash(name, 10);
    await User.create({
      name,
      password: hash,
      type: "user",
      lastActive: new Date(),
      active: i % 10 === 0 ? true : false,
    });
  }
};
