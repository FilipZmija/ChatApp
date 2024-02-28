import {
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "@sequelize/core";

export class RoomConnection extends Model<
  InferAttributes<RoomConnection>,
  InferCreationAttributes<RoomConnection>
> {}
