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
  BelongsToGetAssociationMixin,
} from "@sequelize/core";
import {
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  BelongsToMany,
  HasOne,
  BeforeCreate,
  AfterCreate,
  BelongsTo,
  Default,
} from "@sequelize/core/decorators-legacy";
import { User } from "./User.model.js";
import { Conversation } from "./Conversation.model.js";

export class Room extends Model<
  InferAttributes<Room>,
  InferCreationAttributes<Room>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Default("room")
  declare type: string;

  @Attribute(DataTypes.INTEGER)
  declare conversationId: number | null;

  @BelongsToMany(() => User, { through: "RoomConnection" })
  declare users?: NonAttribute<User[]>;

  @BelongsTo(() => Conversation, "conversationId")
  declare conversation: NonAttribute<Conversation>;

  declare getUsers: BelongsToManyGetAssociationsMixin<User>;
  declare addUser: BelongsToManyAddAssociationMixin<User, User["id"]>;
  declare addUsers: BelongsToManyAddAssociationsMixin<User, User["id"]>;
  declare getConversation: BelongsToGetAssociationMixin<Conversation>;
}
