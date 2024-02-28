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
  BelongsToMany,
  HasMany,
} from "@sequelize/core/decorators-legacy";
import { Room } from "./Room.model.js";
import { Message } from "./Message.model.js";

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
  declare username: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare password: string;

  @HasMany(() => Message, "userId")
  declare message: NonAttribute<Message[]>;

  @BelongsToMany(() => Room, { through: "RoomConnection" })
  declare rooms?: NonAttribute<User[]>;
}
