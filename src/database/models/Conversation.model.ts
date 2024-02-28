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
} from "@sequelize/core";
import {
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  HasMany,
  HasOne,
  BelongsToMany,
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

  @HasMany(() => Message, "conversationId")
  declare messages?: NonAttribute<Message>;

  @BelongsToMany(() => User, { through: "UsersConversation" })
  declare usersConversations: NonAttribute<Conversation[]>;

  declare setUser: BelongsToManyAddAssociationMixin<Room, Room["id"]>;
  declare setUsers: BelongsToManyAddAssociationsMixin<Room, Room["id"]>;
  declare getUsers: BelongsToManyGetAssociationsMixin<User>;
}
