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
  HasOneSetAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
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
import { Message } from "./Message.model.js";

export class Conversation extends Model<
  InferAttributes<Conversation>,
  InferCreationAttributes<Conversation>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare type: "room" | "user";

  @HasMany(() => Message, "conversationId")
  declare messages?: NonAttribute<Message>;

  @HasOne(() => Room, "conversationId")
  declare room: NonAttribute<Room>;

  @BelongsToMany(() => User, { through: "UsersConversation" })
  declare users?: NonAttribute<User[]>;

  declare setUser: BelongsToManyAddAssociationMixin<User, User["id"]>;
  declare setUsers: BelongsToManyAddAssociationsMixin<User, User["id"]>;
  declare getUsers: BelongsToManyGetAssociationsMixin<User>;
  declare assignRoom: HasOneCreateAssociationMixin<Room, "conversationId">;
}
