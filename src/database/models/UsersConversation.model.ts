import {
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "@sequelize/core";

export class UsersConversation extends Model<
  InferAttributes<UsersConversation>,
  InferCreationAttributes<UsersConversation>
> {}
