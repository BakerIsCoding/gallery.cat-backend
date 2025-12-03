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
import { AuditTable, AuditType } from "@interfaces/auditInterfaces";

export interface AuditAttributes {
  id: number;
  table: AuditTable;
  userId: number | null;
  oldData?: object | null;
  newData?: object | null;
  queryType: AuditType;
  date: Date;
}

type AuditCreationAttributes = Optional<
  AuditAttributes,
  "id" | "userId" | "oldData" | "newData"
>;

export const TABLE_NAME = "gallery_audit";

@Table({
  tableName: TABLE_NAME,
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
  table!: AuditTable;

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
  queryType!: AuditType;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column({ type: DataType.DATE })
  date!: Date;
}

export default gallery_audit;
