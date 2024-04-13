import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "@sequelize/core";
import {
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  BelongsTo,
} from "@sequelize/core/decorators-legacy";
import { User } from "./User.model.js";
import { Conversation } from "./Conversation.model.js";

export class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare userId: number;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare conversationId: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare content: string;

  @Attribute(DataTypes.STRING)
  declare status: string;

  @BelongsTo(() => User, "userId")
  declare user: NonAttribute<User>;

  @BelongsTo(() => Conversation, "conversationId")
  declare conversation: NonAttribute<Conversation>;
}
