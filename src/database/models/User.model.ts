import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  BelongsToManyGetAssociationsMixin,
} from "@sequelize/core";
import {
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  BelongsToMany,
  HasMany,
  Default,
} from "@sequelize/core/decorators-legacy";
import { Room } from "./Room.model.js";
import { Message } from "./Message.model.js";
import { Conversation } from "./Conversation.model.js";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
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
  declare password: string;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare active: boolean;

  @Attribute(DataTypes.DATE)
  declare lastActive: Date;

  @HasMany(() => Message, "userId")
  declare message: NonAttribute<Message[]>;

  @BelongsToMany(() => Room, { through: "RoomConnection" })
  declare rooms?: NonAttribute<User[]>;

  @BelongsToMany(() => Conversation, { through: "UsersConversation" })
  declare conversations?: NonAttribute<Conversation[]>;

  declare getConversations: BelongsToManyGetAssociationsMixin<Conversation>;
  declare getRooms: BelongsToManyGetAssociationsMixin<Room>;
}
