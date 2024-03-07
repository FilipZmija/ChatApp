import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
} from "@sequelize/core";
import {
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  HasMany,
  HasOne,
  BelongsToMany,
  BelongsTo,
} from "@sequelize/core/decorators-legacy";
import { User } from "./User.model.js";
import { Room } from "./Room.model.js";
import { Conversation } from "./Conversation.model.js";

export class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
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

  @BelongsTo(() => User, "userId")
  declare user: NonAttribute<User>;

  @BelongsTo(() => Conversation, "conversationId")
  declare conversation: NonAttribute<Conversation>;
}
