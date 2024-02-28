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
  BelongsToMany,
  BelongsTo,
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

  @BelongsToMany(() => User, { through: "RoomConnection" })
  declare users?: NonAttribute<User[]>;
  declare getUsers: BelongsToManyGetAssociationsMixin<User>;
  declare addUser: BelongsToManyAddAssociationMixin<User, User["id"]>;
  declare addUsers: BelongsToManyAddAssociationsMixin<User, User["id"]>;
}
