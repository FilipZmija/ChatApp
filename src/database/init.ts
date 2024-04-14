import { Sequelize } from "@sequelize/core";
import { importFilesFromFolder } from "./helperFunctions.js";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = async () => {
  const models = await importFilesFromFolder("/models");
  const sequelizeInstance = new Sequelize({
    dialect: process.env.DIALECT,
    storage: process.env.STORAGE,
    models: models,
  });
  return sequelizeInstance;
};
