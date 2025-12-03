import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  Unique,
} from "sequelize-typescript";
import { Optional } from "sequelize";

interface GalleryUserAttributes {
  userId: number;
  username: string;
  email: string;
  password?: string | null;
  mailToken?: string | null;
  isMailConfirmed: boolean;
  role: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  imageUrl?: string | null;
}

type GalleryUserCreationAttributes = Optional<
  GalleryUserAttributes,
  | "userId"
  | "mailToken"
  | "isMailConfirmed"
  | "role"
  | "createdAt"
  | "updatedAt"
  | "imageUrl"
>;

export const TABLE_NAME = "gallery_users";

@Table({
  tableName: TABLE_NAME,
  timestamps: false,
})
export class gallery_users
  extends Model<GalleryUserAttributes, GalleryUserCreationAttributes>
  implements GalleryUserAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  userId!: number;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  username!: string;

  @Unique
  @AllowNull(false)
  @Column({ type: DataType.STRING(255) })
  email!: string;

  @AllowNull
  @Column({ type: DataType.TEXT })
  password?: string | null;

  @AllowNull
  @Column({ type: DataType.TEXT })
  mailToken?: string | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  isMailConfirmed!: boolean;

  @Column({
    type: DataType.TINYINT,
    defaultValue: 3,
  })
  role!: number;

  @AllowNull
  @Column({ type: DataType.DATE })
  createdAt?: Date | null;

  @AllowNull
  @Column({ type: DataType.DATE })
  updatedAt?: Date | null;

  @AllowNull
  @Column({ type: DataType.TEXT })
  imageUrl?: string | null;
}

export default gallery_users;
