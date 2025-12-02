import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Index,
  Default,
} from "sequelize-typescript";
import { Optional } from "sequelize";

interface AuditAttributes {
  id: number;
  table: string;
  userId: number | null;
  oldData?: object | null;
  newData?: object | null;
  queryType: "INSERT" | "UPDATE" | "DELETE" | string;
  date: Date;
}

type AuditCreationAttributes = Optional<
  AuditAttributes,
  "id" | "userId" | "oldData" | "newData"
>;

@Table({
  tableName: "gallery_audit",
  timestamps: false,
})
export class gallery_audit
  extends Model<AuditAttributes, AuditCreationAttributes>
  implements AuditAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER.UNSIGNED })
  id!: number;

  @AllowNull(false)
  @Index
  @Column({ type: DataType.STRING })
  table!: string;

  @AllowNull
  @Index
  @Column({ type: DataType.INTEGER.UNSIGNED })
  userId!: number | null;

  @AllowNull
  @Column({ type: DataType.JSON })
  oldData?: object | null;

  @AllowNull
  @Column({ type: DataType.JSON })
  newData?: object | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  queryType!: "INSERT" | "UPDATE" | "DELETE";

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column({ type: DataType.DATE })
  date!: Date;
}

export default gallery_audit;
