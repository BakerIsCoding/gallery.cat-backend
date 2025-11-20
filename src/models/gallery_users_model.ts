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

@Table({
  tableName: "gallery_users",
  timestamps: false,
})
export class gallery_users extends Model<gallery_users> {
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
  password?: string;

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
